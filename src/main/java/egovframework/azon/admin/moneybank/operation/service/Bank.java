package egovframework.azon.admin.moneybank.operation.service;

import lombok.Getter;

import java.util.Arrays;

@Getter
public enum Bank {

    산업은행("002"),
    기업은행("003"),
    국민은행("004"),
    수협은행("007"),
    NH농협은행("011"),
    우리은행("020"),
    대구은행("031"),
    부산은행("032"),
    광주은행("034"),
    제주은행("035"),
    전북은행("037"),
    경남은행("039"),
    하나은행("081"),
    신한은행("088"),
    케이뱅크("089"),
    카카오뱅크("090"),
    토스뱅크("092"),
    유안타증권("209"),
    KB증권("218"),
    IBK투자증권("225"),
    미래에셋증권("238"),
    삼성증권("240"),
    한국투자증권("243"),
    NH투자증권("247"),
    교보증권("261"),
    하이투자증권("262"),
    현대차증권("263"),
    키움증권("264"),
    이베스트투자증권("265"),
    SK증권("266"),
    대신증권("267"),
    한화투자증권("269"),
    하나증권("270"),
    신한금융투자("278"),
    DB금융투자("279"),
    유진투자증권("280"),
    메리츠증권("287"),
    부국증권("290"),
    신영증권("291"),
    케이프투자증권("292");

    private String bankCode;

    Bank(String bankCode) {
        this.bankCode = bankCode;
    }

    public static String findBankNameByBankCode(String bankCode) {
        return Arrays.stream(Bank.values())
                .filter(code -> code.bankCode.equals(bankCode))
                .findFirst().get().name();
    }
}
