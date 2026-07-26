package egovframework.azon.shop.util;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import egovframework.azon.shop.dto.AccountDTO;
import okhttp3.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.Charset;
import java.security.GeneralSecurityException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import java.util.TimeZone;
import java.util.concurrent.TimeUnit;

public class APIClient {
    private final char[] DIGITS_LOWER = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f' };
    private final OkHttpClient client = new OkHttpClient().newBuilder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build();
    private final String COUPANG_HOST = "https://api-gateway.coupang.com";
    private final String NAVER_HOST = "https://api.commerce.naver.com/external";
    private final String STREET11_HOST = "https://api.11st.co.kr";
    private final String INTERPARK_HOST = "https://joinapi.interpark.com";
    private final String ESM_HOST = "https://sa2.esmplus.com/";


    AccountDTO accountDTO;

    public APIClient(AccountDTO accountDTO) {
        this.accountDTO = accountDTO;
    }

    private String generate(String method, String uri, String secretKey, String accessKey) {
        String[] parts = uri.split("\\?");
        if (parts.length > 2) {
            throw new RuntimeException("incorrect uri format");
        } else {
            String path = parts[0];
            String query = "";
            if (parts.length == 2) {
                query = parts[1];
            }
            SimpleDateFormat dateFormatGmt = new SimpleDateFormat("yyMMdd'T'HHmmss'Z'");
            dateFormatGmt.setTimeZone(TimeZone.getTimeZone("GMT"));
            String datetime = dateFormatGmt.format(new Date());
            String message = datetime + method + path + query;

            String signature;
            try {
                SecretKeySpec signingKey = new SecretKeySpec(secretKey.getBytes(Charset.forName("UTF-8")), "HmacSHA256");
                Mac mac = Mac.getInstance("HmacSHA256");
                mac.init(signingKey);
                byte[] rawHmac = mac.doFinal(message.getBytes(Charset.forName("UTF-8")));
                signature = new String(encodeHex(rawHmac, DIGITS_LOWER));
            } catch (GeneralSecurityException var14) {
                throw new IllegalArgumentException("Unexpected error while creating hash: " + var14.getMessage(),
                        var14);
            }

            String result = String.format("CEA algorithm=%s, access-key=%s, signed-date=%s, signature=%s", "HmacSHA256",
                    accessKey, datetime, signature);
            return result;
        }
    }

    private static char[] encodeHex(final byte[] data, final char[] toDigits) {
        final int l = data.length;
        final char[] out = new char[l << 1];
        // two characters form the hex value.
        for (int i = 0, j = 0; i < l; i++) {
            out[j++] = toDigits[(0xF0 & data[i]) >>> 4];
            out[j++] = toDigits[0x0F & data[i]];
        }

        return out;
    }

    public String coupangGet(String path, Map<String,String> params) throws IOException {
        boolean repeat = true;
        int timeout_count = 0;
        while (repeat) {
            HttpUrl.Builder httpBuilder = HttpUrl.parse(COUPANG_HOST + path).newBuilder();

            if (params != null && !params.isEmpty()) {
                for (Map.Entry<String, String> param : params.entrySet()) {
                    httpBuilder.addQueryParameter(param.getKey(), param.getValue());
                }
            }

            String authorization = generate("GET", httpBuilder.build().toString().replaceAll(COUPANG_HOST, ""), accountDTO.getApiSecretKey(), accountDTO.getApiKey());
            Request request = new Request.Builder()
                    .url(httpBuilder.build())
                    .header("authorization", authorization)
                    .header("X-Requested-By", accountDTO.getVendorId())
                    .header("X-EXTENDED-TIMEOUT", "90000")
                    .header("content-type", "application/json")
                    .build();

            try (Response response = client.newCall(request).execute()){
                if (response.isSuccessful()) {
                        ResponseBody body = response.body();
                        if (body != null) {
                            repeat = false;
                            if(timeout_count > 0) System.out.println();
                            return body.string();
                        }
                    } else {
                        JsonParser jsonParser = new JsonParser();
                        JsonObject jsonObj = (JsonObject) jsonParser.parse(response.body().string());

                        if (timeout_count<=20 && jsonObj.get("code").getAsString().equals("400") && jsonObj.get("message").getAsString().equals("Read timed out")) {
                            timeout_count++;
                            try {response.close();} catch (Exception ignored) {}
                            System.out.print("timeout.. " + timeout_count + "회째 재시도중 // ");
                        }else{
                            System.out.println("coupangGet API Error Occurred\n" + jsonObj);
                            repeat = false;
                            break;
                        }
                    }
                    try {response.close();} catch (Exception ignored) {}
                }
            }
        return null;
    }

    public String naverPost(String path, Map<String,String> params, String postBody, String authorization) throws IOException {
        HttpUrl.Builder httpBuilder = HttpUrl.parse(NAVER_HOST + path).newBuilder();

        if (params != null && !params.isEmpty()) {
            for (Map.Entry<String, String> param : params.entrySet()) {
                httpBuilder.addQueryParameter(param.getKey(), param.getValue());
            }
        }

        Request request = new Request.Builder()
                .url(httpBuilder.build())
                .header("Authorization", "Bearer " + authorization)
                .header("content-type", "application/json")
                .post(RequestBody.create(MediaType.parse("application/json"), postBody))
                .build();

        boolean repeat = true;
        while (repeat) {
            try (Response response = client.newCall(request).execute()){
                if (response.isSuccessful()) {
                    ResponseBody body = response.body();
                    if (body != null) {
                        return body.string();
                    }
                } else {
                    JsonParser jsonParser = new JsonParser();
                    JsonObject jsonObj = (JsonObject) jsonParser.parse(response.body().string());
                    if (jsonObj.get("code").getAsString().equals("GW.RATE_LIMIT")) {
                        repeat = true;
                    } else {
                        repeat = false;
                        System.out.println("naverPost API Error Occurred\n" + jsonObj);
                    }
                }
                try {response.close();} catch (Exception ignored) {}
            }
        }
        return null;
    }

    public String naverPost(String path, Map<String,String> params) throws IOException {
        HttpUrl.Builder httpBuilder = HttpUrl.parse(NAVER_HOST + path).newBuilder();

        if (params != null && !params.isEmpty()) {
            for (Map.Entry<String, String> param : params.entrySet()) {
                httpBuilder.addQueryParameter(param.getKey(), param.getValue());
            }
        }

        Request request = new Request.Builder()
                .url(httpBuilder.build())
                .header("content-type", "application/json")
                .post(RequestBody.create(MediaType.parse("application/json"), "{}"))
                .build();

        boolean repeat = true;
        while (repeat) {
            try (Response response = client.newCall(request).execute()){
                if (response.isSuccessful()) {
                    ResponseBody body = response.body();
                    if (body != null) {
                        return body.string();
                    }
                } else {
                    JsonParser jsonParser = new JsonParser();
                    JsonObject jsonObj = (JsonObject) jsonParser.parse(response.body().string());
                    if (jsonObj.get("code").getAsString().equals("GW.RATE_LIMIT")) {
                        repeat = true;
                    } else {
                        repeat = false;
                        System.out.println("naverPost API Error Occurred\n" + jsonObj);
                    }
                }
                try {response.close();} catch (Exception ignored) {}
            }
        }

        return null;
    }
    public String naverGet(String path, Map<String,String> params, String authorization) throws IOException {
        HttpUrl.Builder httpBuilder = HttpUrl.parse(NAVER_HOST + path).newBuilder();

        if (params != null && !params.isEmpty()) {
            for (Map.Entry<String, String> param : params.entrySet()) {
                httpBuilder.addQueryParameter(param.getKey(), param.getValue());
            }
        }

        Request request = new Request.Builder()
                .url(httpBuilder.build())
                .header("Authorization", "Bearer " + authorization)
                .header("content-type", "application/json")
                .build();
        boolean repeat = true;
        while (repeat) {
            
            try (Response response = client.newCall(request).execute()){
                if (response.isSuccessful()) {
                    ResponseBody body = response.body();
                    if (body != null) {
                        return body.string();
                    }
                } else {
                    JsonParser jsonParser = new JsonParser();
                    JsonObject jsonObj = (JsonObject) jsonParser.parse(response.body().string());
                    if (jsonObj.get("message").getAsString().equals("조회 가능한 날짜 범위를 초과했습니다.")) {
                        return "over_date";
                    } else if (jsonObj.get("code").getAsString().equals("GW.RATE_LIMIT")) {
                        repeat = true;
                    } else {
                        repeat = false;
                        System.out.println("naverPost API Error Occurred\n" + jsonObj);
                    }
                }
                try {response.close();} catch (Exception ignored) {}
            }
        }
        return null;
    }

    public String street11Get(String path, Map<String,String> params) throws IOException {
        HttpUrl.Builder httpBuilder = HttpUrl.parse(STREET11_HOST + path).newBuilder();

        if (params != null && !params.isEmpty()) {
            for (Map.Entry<String, String> param : params.entrySet()) {
                httpBuilder.addQueryParameter(param.getKey(), param.getValue());
            }
        }

        Request request = new Request.Builder()
                .url(httpBuilder.build())
                .header("openapikey", accountDTO.getApiKey())
                .header("content-type", "application/json")
                .build();

        try (Response response = client.newCall(request).execute()){
            if (response.isSuccessful()) {
                    ResponseBody body = response.body();
                    if (body != null) {
                        return body.string();
                    }else{
                        System.out.println("street11Get API Body is null\n" + response.body().string());
                    }
                } else {
                    System.out.println("street11Get API Error Occurred\n" + response.body().string());
                }
                try {response.close();} catch (Exception ignored) {}
            }
        return null;
    }

    public String interparkGet(String path, Map<String,String> params) throws IOException {
        HttpUrl.Builder httpBuilder = HttpUrl.parse(INTERPARK_HOST + path).newBuilder();

        if (params != null && !params.isEmpty()) {
            for (Map.Entry<String, String> param : params.entrySet()) {
                httpBuilder.addQueryParameter(param.getKey(), param.getValue());
            }
        }

        Request request = new Request.Builder()
                .url(httpBuilder.build())
                .header("content-type", "application/json")
                .build();

        try (Response response = client.newCall(request).execute()){
            if (response.isSuccessful()) {
                    ResponseBody body = response.body();
                    if (body != null) {
                        return body.string();
                    }else{
                        System.out.println("interparkGet API Body is null\n" + response.body().string());
                    }
                } else {
                    System.out.println("interparkGet API Error Occurred\n" + response.body().string());
                }
                try {response.close();} catch (Exception ignored) {}
            }
        return null;
    }

    public String esmPost(String path, Map<String,String> params, String postBody, String authorization) throws IOException {
        HttpUrl.Builder httpBuilder = HttpUrl.parse(ESM_HOST + path).newBuilder();

        if (params != null && !params.isEmpty()) {
            for (Map.Entry<String, String> param : params.entrySet()) {
                httpBuilder.addQueryParameter(param.getKey(), param.getValue());
            }
        }

        Request request = new Request.Builder()
                .url(httpBuilder.build())
                .header("Authorization", "Bearer " + authorization)
                .header("content-type", "application/json")
                .post(RequestBody.create(MediaType.parse("application/json"), postBody))
                .build();

        try (Response response = client.newCall(request).execute()){
            if (response.isSuccessful()) {
                ResponseBody body = response.body();
                if (body != null) {
                    return body.string();
                }
            } else {
                JsonParser jsonParser = new JsonParser();
                JsonObject jsonObj = (JsonObject) jsonParser.parse(response.body().string());
                System.out.println("esmPost API Error Occurred\n" + jsonObj);
            }
            try {response.close();} catch (Exception ignored) {}
        }
        return null;
    }
}
