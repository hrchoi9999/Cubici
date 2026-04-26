package egovframework.azon.shop.mapper;

import egovframework.azon.shop.dto.SalesDTO;
import egovframework.rte.psl.dataaccess.mapper.Mapper;
import org.apache.ibatis.annotations.Param;

import java.sql.Timestamp;
import java.util.List;

@Mapper
public interface SalesMapper {
    public Timestamp findByShopTypeAndShopIdOrderByOrderDateDesc(@Param("shopType") String shopType, @Param("shopId") String shopId);
    public Timestamp findByShopTypeAndShopIdOrderByUpdDateDesc(@Param("shopType") String shopType, @Param("shopId") String shopId);
    public Timestamp findByShopTypeAndShopIdOrderByInputDateDesc(@Param("shopType") String shopType, @Param("shopId") String shopId);
    public void saveAll(SalesDTO salesDTO);
    String findPaymentAmountByOrderId(@Param("shopType") String shopType, @Param("shopId") String shopId, @Param("orderNo") String orderNo);
    List<String> findSalesDatabyStatusIsNull(@Param("shopType") String shopType, @Param("shopId") String shopId);
}
