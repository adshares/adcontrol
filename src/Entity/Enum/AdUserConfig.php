<?php

namespace App\Entity\Enum;

enum AdUserConfig: string implements ConfigEnum
{
    public const MODULE = 'AdUser';

    case INTERNAL_URL = 'base_aduser_internal_url';
    case URL = 'base_aduser_url';

    public function getModule(): string
    {
        return self::MODULE;
    }
}
