package egovframework.azon.cmmn.dto;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import lombok.Getter;

@Getter
public enum CoupangApiData {
	// sales - 발주서 목록
	orderKey("", Arrays.asList("shipmentBoxId","orderId","orderedAt","paidAt","status","shippingPrice","remotePrice","remoteArea","splitShipping","ableSplitShipping","deliveryCompanyName","invoiceNumber","inTrasitDateTime","refer","deliveredDate")),
	ordererKey("orderer", Arrays.asList("name","email")),
	receiverKey("receiver", Arrays.asList("name","safeNumber","addr1","addr2","postCode")),
	orderItemsKey("", Arrays.asList("vendorItemPackageId","vendorItemPackageName","productId","vendorItemId","vendorItemName","shippingCount","salesPrice","orderPrice","discountPrice","instantCouponDiscount","downloadableCouponDiscount","coupangDiscount","externalVendorSkuCode","sellerProductId","sellerProductName","sellerProductItemName","cancelCount","holdCountForCancel","estimatedShippingDate","plannedShippingDate","invoiceNumberUploadDate","confirmDate","deliveryChargeTypeName","canceled")),
	// sales - 매출내역
	salesKey("", Arrays.asList("orderId","saleType","saleDate","recognitionDate","settlementDate","finalSettlementDate")),
	deliveryFeeKey("delivery", Arrays.asList("settlementAmount")),
	itemsKey("", Arrays.asList("taxType","productName","vendorItemId","vendorItemName","salePrice","quantity","coupangDiscountCoupon","saleAmount","sellerDiscountCoupon","downloadableCoupon","serviceFee","serviceFeeVat","serviceFeeRatio","settlementAmount","externalSellerSkuCode")),
	// sales - 주문건
	orderDetailKey("", Arrays.asList("shipmentBoxId","orderId","orderedAt","paidAt","status","shippingPrice","remotePrice","remoteArea","splitShipping","ableSplitShipping","deliveryCompanyName","invoiceNumber","inTrasitDateTime","deliveredDate","refer")),
	orderDetailItemsKey("", Arrays.asList("vendorItemPackageId","vendorItemPackageName","productId","vendorItemId","vendorItemName","shippingCount","salesPrice","orderPrice","discountPrice","instantCouponDiscount","downloadableCouponDiscount","coupangDiscount","externalVendorSkuCode","sellerProductId","sellerProductName","sellerProductItemName","cancelCount","holdCountForCancel","estimatedShippingDate","plannedShippingDate","invoiceNumberUploadDate","confirmDate","deliveryChargeTypeName","canceled")),
	// settlement
	settleKey("", Arrays.asList("settlementType","settlementDate","revenueRecognitionYearMonth","revenueRecognitionDateFrom","revenueRecognitionDateTo","totalSale","serviceFee","settlementTargetAmount","settlementAmount","lastAmount","pendingReleasedAmount","sellerDiscountCoupon","downloadableCoupon","sellerServiceFee","couranteeFee","couranteeCustomerReward","deductionAmount","debtOfLastWeek","finalAmount","status","storeFeeDiscount")),
	// return,exchange
	returnKey("", Arrays.asList("receiptId","orderId","paymentId","receiptType","receiptStatus","createdAt","modifiedAt","requesterName","requesterPhoneNumber","requesterAddress","requesterAddressDetail","requesterZipCode","cancelReasonCategory1","cancelReasonCategory2","cancelReason","cancelCountSum","returnDeliveryId","returnDeliveryType","releaseStopStatus","enclosePrice","faultByType","preRefund","completeConfirmType","completeConfirmDate","reasonCodeText","returnShippingCharge")),
	returnDeliveryDtosKey("", Arrays.asList("deliveryCompanyCode","deliveryInvoiceNo")),
	returnOrderItemsKey("", Arrays.asList("vendorItemPackageId","vendorItemPackageName","vendorItemId","vendorItemName","cancelCount","purchaseCount","shipmentBoxId","sellerProductId","sellerProductName","releaseStatus")),
	returnCancelkey("", Arrays.asList("cancelId","orderId","refundDeliveryDuty","createdAt","createdAt")),
	exchangeOrderItemsKey("", Arrays.asList("exchangeId","orderId","exchangeStatus","cancelReason","faultType","reasonCodeText","reasonEtcDetail","deliveryStatus")),
	exchangeAddressDtoV1Key("requester", Arrays.asList("returnCustomerName","returnMobile","returnAddress","returnAddressDetail","returnAddressZipCode")),
	returnDeliveryKey("", Arrays.asList("deliveryCompanyCode","deliveryInvoiceNo","releaseStatus")),
	exchangeOrdererKey("", Arrays.asList("orderItemId","orderItemName","orderPackageId","orderPackageName","createdAt","modifiedAt","quantity","originalShipmentBoxId","targetItemId","targetItemName")),
	EMPTY("", Collections.emptyList());

	private final String listName;
	private final List<String> keyList;
	
	CoupangApiData(String listName, List<String> keyList){
		this.listName = listName;
		this.keyList = keyList;
	}
	
	public static String findByListName(String value) {
		return Arrays.stream(CoupangApiData.values())
				.filter(result -> result.name().equals(value+"Key"))
				.findFirst().get().listName;				
	}
	
	public static List<String> findByKeyList(String value){
		return Arrays.stream(CoupangApiData.values())
				.filter(result -> result.name().equals(value+"Key"))
				.findFirst().get().keyList;
	}

	public static CoupangApiData findByKey(String value) {
		return Arrays.stream(CoupangApiData.values())
				.filter(coupangApiData -> coupangApiData.hasKey(value))
				.findAny()
				.orElse(EMPTY);
	}	

	public boolean hasKey(String value) {
		return keyList.stream().anyMatch(result -> result.equals(value));
	}

}
