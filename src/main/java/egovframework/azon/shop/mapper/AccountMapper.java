package egovframework.azon.shop.mapper;

import egovframework.azon.shop.dto.AccountDTO;
import egovframework.rte.psl.dataaccess.mapper.Mapper;

import java.util.List;

@Mapper
public interface AccountMapper {
    public List<AccountDTO> findByShopType(String shopType);
}
