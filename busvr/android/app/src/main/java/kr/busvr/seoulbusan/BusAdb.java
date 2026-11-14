package kr.busvr.seoulbusan;

import android.content.Context;
import android.os.Build;

import androidx.annotation.NonNull;

import org.bouncycastle.asn1.ASN1EncodableVector;
import org.bouncycastle.asn1.ASN1Integer;
import org.bouncycastle.asn1.DERBitString;
import org.bouncycastle.asn1.DERNull;
import org.bouncycastle.asn1.DERSequence;
import org.bouncycastle.asn1.pkcs.PKCSObjectIdentifiers;
import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.asn1.x509.AlgorithmIdentifier;
import org.bouncycastle.asn1.x509.SubjectPublicKeyInfo;
import org.bouncycastle.asn1.x509.TBSCertificate;
import org.bouncycastle.asn1.x509.Time;
import org.bouncycastle.asn1.x509.V3TBSCertificateGenerator;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.SecureRandom;
import java.security.Signature;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Date;

import io.github.muntashirakon.adb.AbsAdbConnectionManager;

/**
 * ADB client identity of the bus app, used to reach the headset's own adbd over Wireless debugging (no PC needed).
 * The key and its self-signed certificate are created once and kept in the app's private storage; after the rider
 * pairs once, adbd trusts this key and the app can start the seat-monitor helper by itself on every boot.
 */
public final class BusAdb extends AbsAdbConnectionManager {
    private static BusAdb instance;
    private final PrivateKey privateKey;
    private final Certificate certificate;

    public static synchronized BusAdb get(Context context) throws Exception {
        if (instance == null) instance = new BusAdb(context.getApplicationContext());
        return instance;
    }

    private BusAdb(Context context) throws Exception {
        setApi(Build.VERSION.SDK_INT);
        setTimeout(10, java.util.concurrent.TimeUnit.SECONDS);
        File keyFile = new File(context.getFilesDir(), "adb_key.pk8"), certFile = new File(context.getFilesDir(), "adb_cert.der");
        PrivateKey pk = null; Certificate cert = null;
        if (keyFile.exists() && certFile.exists()) {
            try {
                pk = KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(readAll(keyFile)));
                cert = CertificateFactory.getInstance("X.509").generateCertificate(new ByteArrayInputStream(readAll(certFile)));
            } catch (Exception e) {
                pk = null; cert = null;
            }
        }
        if (pk == null || cert == null) {
            KeyPairGenerator g = KeyPairGenerator.getInstance("RSA");
            g.initialize(2048, new SecureRandom());
            KeyPair kp = g.generateKeyPair();
            pk = kp.getPrivate();
            cert = selfSigned(kp);
            writeAll(keyFile, pk.getEncoded());
            writeAll(certFile, cert.getEncoded());
        }
        privateKey = pk;
        certificate = cert;
    }

    /** X.509 v3, SHA256withRSA, CN=busvr, valid for 30 years. */
    private static Certificate selfSigned(KeyPair kp) throws Exception {
        X500Name name = new X500Name("CN=busvr");
        AlgorithmIdentifier sigAlg = new AlgorithmIdentifier(PKCSObjectIdentifiers.sha256WithRSAEncryption, DERNull.INSTANCE);
        long now = System.currentTimeMillis();
        V3TBSCertificateGenerator tbsGen = new V3TBSCertificateGenerator();
        tbsGen.setSerialNumber(new ASN1Integer(BigInteger.valueOf(now)));
        tbsGen.setIssuer(name);
        tbsGen.setSubject(name);
        tbsGen.setStartDate(new Time(new Date(now - 86400000L)));
        tbsGen.setEndDate(new Time(new Date(now + 30L * 365 * 86400000L)));
        tbsGen.setSignature(sigAlg);
        tbsGen.setSubjectPublicKeyInfo(SubjectPublicKeyInfo.getInstance(kp.getPublic().getEncoded()));
        TBSCertificate tbs = tbsGen.generateTBSCertificate();
        Signature s = Signature.getInstance("SHA256withRSA");
        s.initSign(kp.getPrivate());
        s.update(tbs.getEncoded("DER"));
        ASN1EncodableVector v = new ASN1EncodableVector();
        v.add(tbs);
        v.add(sigAlg);
        v.add(new DERBitString(s.sign()));
        byte[] der = new DERSequence(v).getEncoded("DER");
        return CertificateFactory.getInstance("X.509").generateCertificate(new ByteArrayInputStream(der));
    }

    private static byte[] readAll(File f) throws Exception {
        try (FileInputStream in = new FileInputStream(f)) {
            byte[] b = new byte[(int) f.length()];
            int off = 0, n;
            while (off < b.length && (n = in.read(b, off, b.length - off)) > 0) off += n;
            return b;
        }
    }

    private static void writeAll(File f, byte[] data) throws Exception {
        try (FileOutputStream out = new FileOutputStream(f)) { out.write(data); }
    }

    @NonNull @Override protected PrivateKey getPrivateKey() { return privateKey; }
    @NonNull @Override protected Certificate getCertificate() { return certificate; }
    @NonNull @Override protected String getDeviceName() { return "busvr"; }
}
