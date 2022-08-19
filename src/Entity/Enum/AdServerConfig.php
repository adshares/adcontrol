<?php

namespace App\Entity\Enum;

enum AdServerConfig implements ConfigEnum
{
    public const MODULE = 'AdServer';

    case AutoConfirmationEnabled;
    case AutoRegistrationEnabled;
    case AutoWithdrawalLimitAds;
    case AutoWithdrawalLimitBsc;
    case AutoWithdrawalLimitBtc;
    case AutoWithdrawalLimitEth;
    case ColdWalletAddress;
    case ColdWalletIsActive;
    case EmailVerificationRequired;
    case HotWalletMaxValue;
    case HotWalletMinValue;
    case LicenseData;
    case LicenseKey;
    case Name;
    case OperatorRxFee;
    case OperatorTxFee;
    case ReferralRefundCommission;
    case ReferralRefundEnabled;
    case RegistrationMode;
    case SiteAcceptBannersManually;
    case SiteClassifierLocalBanners;
    case Url;
    case WalletAddress;
    case WalletNodeHost;
    case WalletNodePort;
    case WalletSecretKey;

    public function getModule(): string
    {
        return self::MODULE;
    }
}
