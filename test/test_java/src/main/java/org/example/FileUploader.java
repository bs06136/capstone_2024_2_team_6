package org.example;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;  // Add this import
import java.nio.charset.StandardCharsets;

public class FileUploader {
    public static void main(String[] args) {
        String baseUrl = "http://capstonedesign.duckdns.org:8080/signal";
        sendFile(baseUrl, "C:\\Users\\bszxc\\IdeaProjects\\capstone_2024_2_team_6\\test\\test.txt", true, false);
    }

    public static void sendFile(String baseUrl, String filePath, boolean save, boolean archive) {
        String boundary = "----WebKitFormBoundary" + Long.toHexString(System.currentTimeMillis()); // Boundary definition

        try {
            StringBuilder urlBuilder = new StringBuilder(baseUrl);
            urlBuilder.append("?");
            if (save) {
                urlBuilder.append("save=true");
            }
            if (archive) {
                if (save) {
                    urlBuilder.append("&");
                }
                urlBuilder.append("archive=true");
            }

            URL targetUrl = new URL(urlBuilder.toString());
            HttpURLConnection connection = (HttpURLConnection) targetUrl.openConnection();
            connection.setDoOutput(true);
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

            try (OutputStream outputStream = connection.getOutputStream();
                 PrintWriter writer = new PrintWriter(new OutputStreamWriter(outputStream, StandardCharsets.UTF_8), true)) {

                File file = new File(filePath);
                // File part
                writer.append("--" + boundary).append("\r\n");
                writer.append("Content-Disposition: form-data; name=\"file\"; filename=\"" + file.getName() + "\"").append("\r\n");
                writer.append("Content-Type: " + URLConnection.guessContentTypeFromName(file.getName())).append("\r\n");
                writer.append("Content-Transfer-Encoding: binary").append("\r\n");
                writer.append("\r\n").flush();

                try (FileInputStream fileInputStream = new FileInputStream(file)) {
                    byte[] buffer = new byte[4096];
                    int bytesRead;
                    while ((bytesRead = fileInputStream.read(buffer)) != -1) {
                        outputStream.write(buffer, 0, bytesRead);
                    }
                }
                outputStream.flush();
                writer.append("\r\n").flush(); // Ensure to append a new line at the end of the file part

                // End of multipart/form-data
                writer.append("--" + boundary + "--").append("\r\n").flush();
            }

            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                System.out.println("파일이 성공적으로 전송되었습니다.");
            } else {
                System.out.println("파일 전송 실패: " + responseCode);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
