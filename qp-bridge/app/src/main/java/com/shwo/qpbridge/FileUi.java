package com.shwo.qpbridge;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.List;

/** 두 앱이 함께 쓰는 '파일 주고받기' 화면 부분 (layout/file_section.xml). */
public final class FileUi implements FileTransfer.Ui {

    public static final int REQ_PICK = 77;

    private final Activity activity;
    private final FileTransfer ft;
    private final Hub hub;
    private final TextView status;
    private final Button cancel;
    private final LinearLayout list;

    /** @param otherDeviceWithRo "퀘스트로" / "휴대폰으로" */
    public FileUi(Activity a, String otherDeviceWithRo) {
        activity = a;
        ft = FileTransfer.get(a);
        hub = Hub.get(a);
        Button send = a.findViewById(R.id.fileSendBtn);
        cancel = a.findViewById(R.id.fileCancelBtn);
        status = a.findViewById(R.id.fileStatus);
        list = a.findViewById(R.id.fileList);
        send.setText(otherDeviceWithRo + " 파일 보내기");
        send.setOnClickListener(v -> pick());
        cancel.setOnClickListener(v -> ft.cancelAll());
        for (int i = ft.received.size() - 1; i >= 0; i--) addRow(ft.received.get(i));
        ft.setUi(this);
    }

    public void detach() {
        ft.setUi(null);
    }

    private void pick() {
        if (!hub.isReady()) hub.log("먼저 연결하세요. (연결되면 바로 보냅니다)");
        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT)
                .addCategory(Intent.CATEGORY_OPENABLE)
                .setType("*/*")
                .putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
        try {
            activity.startActivityForResult(i, REQ_PICK);
        } catch (ActivityNotFoundException e) {
            try {
                activity.startActivityForResult(new Intent(Intent.ACTION_GET_CONTENT)
                        .addCategory(Intent.CATEGORY_OPENABLE).setType("*/*")
                        .putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true), REQ_PICK);
            } catch (ActivityNotFoundException e2) {
                hub.log("이 기기에서 파일 선택 창을 열 수 없어요. 다른 앱의 '공유 → QP브릿지'로 보내 보세요.");
            }
        }
    }

    /** 액티비티의 onActivityResult 에서 호출. 처리했으면 true */
    public boolean onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode != REQ_PICK) return false;
        if (resultCode != Activity.RESULT_OK || data == null) return true;
        List<Uri> uris = new ArrayList<>();
        ClipData clip = data.getClipData();
        if (clip != null) for (int i = 0; i < clip.getItemCount(); i++) uris.add(clip.getItemAt(i).getUri());
        else if (data.getData() != null) uris.add(data.getData());
        if (!uris.isEmpty()) ft.send(uris);
        return true;
    }

    /** 다른 앱에서 '공유 → QP브릿지' 로 넘어온 파일 보내기 */
    @SuppressWarnings("deprecation")
    public void handleShareIntent(Intent intent) {
        if (intent == null) return;
        String a = intent.getAction();
        List<Uri> uris = new ArrayList<>();
        if (Intent.ACTION_SEND.equals(a)) {
            Uri u = intent.getParcelableExtra(Intent.EXTRA_STREAM);
            if (u != null) uris.add(u);
        } else if (Intent.ACTION_SEND_MULTIPLE.equals(a)) {
            ArrayList<Uri> l = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
            if (l != null) uris.addAll(l);
        } else {
            return;
        }
        intent.setAction(null); // 다시 처리하지 않게
        if (uris.isEmpty()) {
            hub.log("공유받은 내용에 파일이 없어요.");
            return;
        }
        hub.log("공유받은 파일 " + uris.size() + "개를 보냅니다.");
        ft.send(uris);
    }

    @Override
    public void onTransferText(String text, boolean active) {
        status.setText(text);
        status.setVisibility(text.isEmpty() ? View.GONE : View.VISIBLE);
        cancel.setVisibility(active ? View.VISIBLE : View.GONE);
    }

    @Override
    public void onReceived(FileTransfer.Received r) {
        addRow(r);
    }

    private void addRow(FileTransfer.Received r) {
        Button b = new Button(activity);
        b.setAllCaps(false);
        b.setText((r.uri != null ? "열기: " : "") + r.name + " (" + FileTransfer.human(r.size) + ")");
        b.setOnClickListener(v -> open(r));
        list.addView(b, 0, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));
    }

    private void open(FileTransfer.Received r) {
        if (r.uri == null) {
            hub.log("저장 위치: " + r.where);
            return;
        }
        Intent i = new Intent(Intent.ACTION_VIEW)
                .setDataAndType(r.uri, r.mime != null ? r.mime : "*/*")
                .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            activity.startActivity(Intent.createChooser(i, r.name));
        } catch (ActivityNotFoundException e) {
            hub.log("이 파일을 열 수 있는 앱이 없어요. 저장 위치: " + r.where);
        }
    }
}
