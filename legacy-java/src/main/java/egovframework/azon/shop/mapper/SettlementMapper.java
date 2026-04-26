package egovframework.azon.shop.mapper;

import egovframework.azon.shop.dto.SettlementDTO;
import egovframework.rte.psl.dataaccess.mapper.Mapper;
import org.apache.ibatis.annotations.Param;

import java.sql.Timestamp;

@Mapper
public interface SettlementMapper {
    public Timestamp findByShopTypeAndShopIdOrderByInputDateDesc(@Param("shopType") String shopType, @Param("shopId") String shopId);
    public void saveAll(SettlementDTO settlementDTO);
}
