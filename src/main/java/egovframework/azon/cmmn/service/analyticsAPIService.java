package egovframework.azon.cmmn.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;

import java.io.FileInputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;

import java.util.ArrayList;
import java.util.Arrays;

import java.util.HashMap;
import java.util.List;

import egovframework.azon.cmmn.component.CubiciUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.api.services.analyticsreporting.v4.AnalyticsReportingScopes;
import com.google.api.services.analyticsreporting.v4.AnalyticsReporting;

import com.google.api.services.analyticsreporting.v4.model.ColumnHeader;
import com.google.api.services.analyticsreporting.v4.model.DateRange;
import com.google.api.services.analyticsreporting.v4.model.DateRangeValues;
import com.google.api.services.analyticsreporting.v4.model.GetReportsRequest;
import com.google.api.services.analyticsreporting.v4.model.GetReportsResponse;
import com.google.api.services.analyticsreporting.v4.model.Metric;
import com.google.api.services.analyticsreporting.v4.model.MetricHeaderEntry;
import com.google.api.services.analyticsreporting.v4.model.Report;
import com.google.api.services.analyticsreporting.v4.model.ReportRequest;
import com.google.api.services.analyticsreporting.v4.model.ReportRow;

import egovframework.azon.cmmn.mapper.CmmScheduledMapper;

@Service
public class analyticsAPIService {
	private static final String APPLICATION_NAME = "Hello Analytics Reporting";
	private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
	private static final String KEY_FILE_LOCATION = analyticsAPIService.class.getResource("").getPath();
	private static final String VIEW_ID = "230297644";

	Logger logger = LoggerFactory.getLogger(analyticsAPIService.class);
	
	@Autowired
	CmmScheduledMapper cmmschedulemapper;

	// 애널리틱스 API - 활동지표
	//@Scheduled(cron = "0 0 0 * * *")
	public void analyticsAPIActivity() {
		// 애널리틱스 스케쥴 성공여부 체크
		HashMap<String, Object> analyticsScheduled = new HashMap<>();
		String CAUSE = "성공";
		try {
			AnalyticsReporting service = initializeAnalyticsReporting();

			GetReportsResponse response = getReport(service);
			printResponse(response);
			analyticsScheduled.put("SCHEDULED_NAME", "[구글 애널리틱스][활동 지표]");

		} catch (Exception e) {
			logger.error(e.getMessage());
			CAUSE = "실패";
		} finally {
			analyticsScheduled.put("CAUSE", CAUSE);
			cmmschedulemapper.insertAnalyticsErrorReport(analyticsScheduled);
		}
	}

	// Analytics json키 값 체크
	private static AnalyticsReporting initializeAnalyticsReporting() throws GeneralSecurityException, IOException {
		
		HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
		GoogleCredential credential = GoogleCredential.fromStream(new FileInputStream(KEY_FILE_LOCATION))
				.createScoped(AnalyticsReportingScopes.all());

		// Analytics Reporting 서비스 개체를 생성
		return new AnalyticsReporting.Builder(httpTransport, JSON_FACTORY, credential)
				.setApplicationName(APPLICATION_NAME).build();
	}

	private GetReportsResponse getReport(AnalyticsReporting service) throws IOException {
		HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
		
		// DateRange 객체 생성
		DateRange dateRange = new DateRange();
		dateRange.setStartDate(defaultDate.get("toDate").toString());
		dateRange.setEndDate(defaultDate.get("toDate").toString());

		// Metrics 객체 생성
		Metric avgSessionDuration = new Metric().setExpression("ga:avgSessionDuration").setAlias("avgSessionDuration");

		Metric users = new Metric().setExpression("ga:users").setAlias("users");

		Metric pageviews = new Metric().setExpression("ga:pageviews").setAlias("pageviews");

		// ReportRequest 객체 생성
		// 평균 새션 시간
		ReportRequest request1 = new ReportRequest().setViewId(VIEW_ID).setDateRanges(Arrays.asList(dateRange))
				.setMetrics(Arrays.asList(avgSessionDuration));
		// 방문자수
		ReportRequest request2 = new ReportRequest().setViewId(VIEW_ID).setDateRanges(Arrays.asList(dateRange))
				.setMetrics(Arrays.asList(users));
		// 페이지 뷰 수
		ReportRequest request3 = new ReportRequest().setViewId(VIEW_ID).setDateRanges(Arrays.asList(dateRange))
				.setMetrics(Arrays.asList(pageviews));

		ArrayList<ReportRequest> requests = new ArrayList<ReportRequest>();
		requests.add(request1);
		requests.add(request2);
		requests.add(request3);

		// GetReportsRequest 객체 생성.
		GetReportsRequest getReport = new GetReportsRequest().setReportRequests(requests);

		// Call the batchGet method.
		GetReportsResponse response = service.reports().batchGet(getReport).execute();

		// Return the response.
		return response;
	}

	private void printResponse(GetReportsResponse response) {
		
		HashMap<String, Object> defaultDate = CubiciUtils.defaultSetDate();
		HashMap<String, Object> analyticsActivity = new HashMap<>();
		analyticsActivity.put("STANDARD_DATE",defaultDate.get("toDate").toString());

		for (Report report : response.getReports()) {
			ColumnHeader header = report.getColumnHeader();
			List<MetricHeaderEntry> metricHeaders = header.getMetricHeader().getMetricHeaderEntries();
			List<ReportRow> rows = report.getData().getRows();

			if (rows == null) {
				System.out.println("No data found for " + VIEW_ID);
				analyticsActivity.put("AVG_USE_TIME", 0);
				analyticsActivity.put("VISIT_COUNT", 0);
				analyticsActivity.put("PAGE_VIEWS_COUNT", 0);
				cmmschedulemapper.insertAnalytics(analyticsActivity);
				return;
			}

			for (ReportRow row : rows) {
				List<DateRangeValues> metrics = row.getMetrics();
				for (int j = 0; j < metrics.size(); j++) {
					DateRangeValues values = metrics.get(j);
					for (int k = 0; k < values.getValues().size() && k < metricHeaders.size(); k++) {
						if (metricHeaders.get(k).getName().equals("avgSessionDuration")) {
							analyticsActivity.put("AVG_USE_TIME",
									Math.round(Double.valueOf(values.getValues().get(k))));
						}
						if (metricHeaders.get(k).getName().equals("users")) {
							analyticsActivity.put("VISIT_COUNT", Integer.valueOf(values.getValues().get(k)));
						}
						if (metricHeaders.get(k).getName().equals("pageviews")) {
							analyticsActivity.put("PAGE_VIEWS_COUNT", Integer.valueOf(values.getValues().get(k)));
						}
					}
				}
			}
		}
		// 활동지표 값 insert
		cmmschedulemapper.insertAnalytics(analyticsActivity);
	}
}
