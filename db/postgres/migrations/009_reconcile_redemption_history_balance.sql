update moneybank_redemption_history
set outstanding_balance =
    coalesce(cumulative_provision_amount, 0)
    - coalesce(cumulative_repayment_amount, 0)
where coalesce(outstanding_balance, 0)
   <> coalesce(cumulative_provision_amount, 0)
    - coalesce(cumulative_repayment_amount, 0);
