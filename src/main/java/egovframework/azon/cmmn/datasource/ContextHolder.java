package egovframework.azon.cmmn.datasource;

public class ContextHolder {
	private static final ThreadLocal<DataSourceType> CONTEXT_HOLDER = new ThreadLocal<DataSourceType>();

	public static void setDataSourceType(DataSourceType dataSourceType) {
		CONTEXT_HOLDER.set(dataSourceType);
	}

	public static DataSourceType getDataSourceType() {
		return CONTEXT_HOLDER.get();
	}

	public static void clearDataSourceType() {
		CONTEXT_HOLDER.remove();
	}
}
