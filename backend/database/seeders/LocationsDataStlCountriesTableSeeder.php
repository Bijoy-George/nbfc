<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class LocationsDataStlCountriesTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {


        \DB::table('countries')->delete();

        \DB::table('countries')->insert(array (
            0 =>
            array (
                'id' => 1,
                'sortname' => 'AF',
                'name' => 'Afghanistan',
                'phoneCode' => 93,
            ),
            1 =>
            array (
                'id' => 2,
                'sortname' => 'AL',
                'name' => 'Albania',
                'phoneCode' => 355,
            ),
            2 =>
            array (
                'id' => 3,
                'sortname' => 'DZ',
                'name' => 'Algeria',
                'phoneCode' => 213,
            ),
            3 =>
            array (
                'id' => 4,
                'sortname' => 'AS',
                'name' => 'American Samoa',
                'phoneCode' => 1684,
            ),
            4 =>
            array (
                'id' => 5,
                'sortname' => 'AD',
                'name' => 'Andorra',
                'phoneCode' => 376,
            ),
            5 =>
            array (
                'id' => 6,
                'sortname' => 'AO',
                'name' => 'Angola',
                'phoneCode' => 244,
            ),
            6 =>
            array (
                'id' => 7,
                'sortname' => 'AI',
                'name' => 'Anguilla',
                'phoneCode' => 1264,
            ),
            7 =>
            array (
                'id' => 8,
                'sortname' => 'AQ',
                'name' => 'Antarctica',
                'phoneCode' => 0,
            ),
            8 =>
            array (
                'id' => 9,
                'sortname' => 'AG',
                'name' => 'Antigua And Barbuda',
                'phoneCode' => 1268,
            ),
            9 =>
            array (
                'id' => 10,
                'sortname' => 'AR',
                'name' => 'Argentina',
                'phoneCode' => 54,
            ),
            10 =>
            array (
                'id' => 11,
                'sortname' => 'AM',
                'name' => 'Armenia',
                'phoneCode' => 374,
            ),
            11 =>
            array (
                'id' => 12,
                'sortname' => 'AW',
                'name' => 'Aruba',
                'phoneCode' => 297,
            ),
            12 =>
            array (
                'id' => 13,
                'sortname' => 'AU',
                'name' => 'Australia',
                'phoneCode' => 61,
            ),
            13 =>
            array (
                'id' => 14,
                'sortname' => 'AT',
                'name' => 'Austria',
                'phoneCode' => 43,
            ),
            14 =>
            array (
                'id' => 15,
                'sortname' => 'AZ',
                'name' => 'Azerbaijan',
                'phoneCode' => 994,
            ),
            15 =>
            array (
                'id' => 16,
                'sortname' => 'BS',
                'name' => 'Bahamas The',
                'phoneCode' => 1242,
            ),
            16 =>
            array (
                'id' => 17,
                'sortname' => 'BH',
                'name' => 'Bahrain',
                'phoneCode' => 973,
            ),
            17 =>
            array (
                'id' => 18,
                'sortname' => 'BD',
                'name' => 'Bangladesh',
                'phoneCode' => 880,
            ),
            18 =>
            array (
                'id' => 19,
                'sortname' => 'BB',
                'name' => 'Barbados',
                'phoneCode' => 1246,
            ),
            19 =>
            array (
                'id' => 20,
                'sortname' => 'BY',
                'name' => 'Belarus',
                'phoneCode' => 375,
            ),
            20 =>
            array (
                'id' => 21,
                'sortname' => 'BE',
                'name' => 'Belgium',
                'phoneCode' => 32,
            ),
            21 =>
            array (
                'id' => 22,
                'sortname' => 'BZ',
                'name' => 'Belize',
                'phoneCode' => 501,
            ),
            22 =>
            array (
                'id' => 23,
                'sortname' => 'BJ',
                'name' => 'Benin',
                'phoneCode' => 229,
            ),
            23 =>
            array (
                'id' => 24,
                'sortname' => 'BM',
                'name' => 'Bermuda',
                'phoneCode' => 1441,
            ),
            24 =>
            array (
                'id' => 25,
                'sortname' => 'BT',
                'name' => 'Bhutan',
                'phoneCode' => 975,
            ),
            25 =>
            array (
                'id' => 26,
                'sortname' => 'BO',
                'name' => 'Bolivia',
                'phoneCode' => 591,
            ),
            26 =>
            array (
                'id' => 27,
                'sortname' => 'BA',
                'name' => 'Bosnia and Herzegovina',
                'phoneCode' => 387,
            ),
            27 =>
            array (
                'id' => 28,
                'sortname' => 'BW',
                'name' => 'Botswana',
                'phoneCode' => 267,
            ),
            28 =>
            array (
                'id' => 29,
                'sortname' => 'BV',
                'name' => 'Bouvet Island',
                'phoneCode' => 0,
            ),
            29 =>
            array (
                'id' => 30,
                'sortname' => 'BR',
                'name' => 'Brazil',
                'phoneCode' => 55,
            ),
            30 =>
            array (
                'id' => 31,
                'sortname' => 'IO',
                'name' => 'British Indian Ocean Territory',
                'phoneCode' => 246,
            ),
            31 =>
            array (
                'id' => 32,
                'sortname' => 'BN',
                'name' => 'Brunei',
                'phoneCode' => 673,
            ),
            32 =>
            array (
                'id' => 33,
                'sortname' => 'BG',
                'name' => 'Bulgaria',
                'phoneCode' => 359,
            ),
            33 =>
            array (
                'id' => 34,
                'sortname' => 'BF',
                'name' => 'Burkina Faso',
                'phoneCode' => 226,
            ),
            34 =>
            array (
                'id' => 35,
                'sortname' => 'BI',
                'name' => 'Burundi',
                'phoneCode' => 257,
            ),
            35 =>
            array (
                'id' => 36,
                'sortname' => 'KH',
                'name' => 'Cambodia',
                'phoneCode' => 855,
            ),
            36 =>
            array (
                'id' => 37,
                'sortname' => 'CM',
                'name' => 'Cameroon',
                'phoneCode' => 237,
            ),
            37 =>
            array (
                'id' => 38,
                'sortname' => 'CA',
                'name' => 'Canada',
                'phoneCode' => 1,
            ),
            38 =>
            array (
                'id' => 39,
                'sortname' => 'CV',
                'name' => 'Cape Verde',
                'phoneCode' => 238,
            ),
            39 =>
            array (
                'id' => 40,
                'sortname' => 'KY',
                'name' => 'Cayman Islands',
                'phoneCode' => 1345,
            ),
            40 =>
            array (
                'id' => 41,
                'sortname' => 'CF',
                'name' => 'Central African Republic',
                'phoneCode' => 236,
            ),
            41 =>
            array (
                'id' => 42,
                'sortname' => 'TD',
                'name' => 'Chad',
                'phoneCode' => 235,
            ),
            42 =>
            array (
                'id' => 43,
                'sortname' => 'CL',
                'name' => 'Chile',
                'phoneCode' => 56,
            ),
            43 =>
            array (
                'id' => 44,
                'sortname' => 'CN',
                'name' => 'China',
                'phoneCode' => 86,
            ),
            44 =>
            array (
                'id' => 45,
                'sortname' => 'CX',
                'name' => 'Christmas Island',
                'phoneCode' => 61,
            ),
            45 =>
            array (
                'id' => 46,
                'sortname' => 'CC',
            'name' => 'Cocos (Keeling) Islands',
                'phoneCode' => 672,
            ),
            46 =>
            array (
                'id' => 47,
                'sortname' => 'CO',
                'name' => 'Colombia',
                'phoneCode' => 57,
            ),
            47 =>
            array (
                'id' => 48,
                'sortname' => 'KM',
                'name' => 'Comoros',
                'phoneCode' => 269,
            ),
            48 =>
            array (
                'id' => 49,
                'sortname' => 'CG',
                'name' => 'Republic Of The Congo',
                'phoneCode' => 242,
            ),
            49 =>
            array (
                'id' => 50,
                'sortname' => 'CD',
                'name' => 'Democratic Republic Of The Congo',
                'phoneCode' => 242,
            ),
            50 =>
            array (
                'id' => 51,
                'sortname' => 'CK',
                'name' => 'Cook Islands',
                'phoneCode' => 682,
            ),
            51 =>
            array (
                'id' => 52,
                'sortname' => 'CR',
                'name' => 'Costa Rica',
                'phoneCode' => 506,
            ),
            52 =>
            array (
                'id' => 53,
                'sortname' => 'CI',
            'name' => 'Cote D\'\'Ivoire (Ivory Coast)',
                'phoneCode' => 225,
            ),
            53 =>
            array (
                'id' => 54,
                'sortname' => 'HR',
            'name' => 'Croatia (Hrvatska)',
                'phoneCode' => 385,
            ),
            54 =>
            array (
                'id' => 55,
                'sortname' => 'CU',
                'name' => 'Cuba',
                'phoneCode' => 53,
            ),
            55 =>
            array (
                'id' => 56,
                'sortname' => 'CY',
                'name' => 'Cyprus',
                'phoneCode' => 357,
            ),
            56 =>
            array (
                'id' => 57,
                'sortname' => 'CZ',
                'name' => 'Czech Republic',
                'phoneCode' => 420,
            ),
            57 =>
            array (
                'id' => 58,
                'sortname' => 'DK',
                'name' => 'Denmark',
                'phoneCode' => 45,
            ),
            58 =>
            array (
                'id' => 59,
                'sortname' => 'DJ',
                'name' => 'Djibouti',
                'phoneCode' => 253,
            ),
            59 =>
            array (
                'id' => 60,
                'sortname' => 'DM',
                'name' => 'Dominica',
                'phoneCode' => 1767,
            ),
            60 =>
            array (
                'id' => 61,
                'sortname' => 'DO',
                'name' => 'Dominican Republic',
                'phoneCode' => 1809,
            ),
            61 =>
            array (
                'id' => 62,
                'sortname' => 'TP',
                'name' => 'East Timor',
                'phoneCode' => 670,
            ),
            62 =>
            array (
                'id' => 63,
                'sortname' => 'EC',
                'name' => 'Ecuador',
                'phoneCode' => 593,
            ),
            63 =>
            array (
                'id' => 64,
                'sortname' => 'EG',
                'name' => 'Egypt',
                'phoneCode' => 20,
            ),
            64 =>
            array (
                'id' => 65,
                'sortname' => 'SV',
                'name' => 'El Salvador',
                'phoneCode' => 503,
            ),
            65 =>
            array (
                'id' => 66,
                'sortname' => 'GQ',
                'name' => 'Equatorial Guinea',
                'phoneCode' => 240,
            ),
            66 =>
            array (
                'id' => 67,
                'sortname' => 'ER',
                'name' => 'Eritrea',
                'phoneCode' => 291,
            ),
            67 =>
            array (
                'id' => 68,
                'sortname' => 'EE',
                'name' => 'Estonia',
                'phoneCode' => 372,
            ),
            68 =>
            array (
                'id' => 69,
                'sortname' => 'ET',
                'name' => 'Ethiopia',
                'phoneCode' => 251,
            ),
            69 =>
            array (
                'id' => 70,
                'sortname' => 'XA',
                'name' => 'External Territories of Australia',
                'phoneCode' => 61,
            ),
            70 =>
            array (
                'id' => 71,
                'sortname' => 'FK',
                'name' => 'Falkland Islands',
                'phoneCode' => 500,
            ),
            71 =>
            array (
                'id' => 72,
                'sortname' => 'FO',
                'name' => 'Faroe Islands',
                'phoneCode' => 298,
            ),
            72 =>
            array (
                'id' => 73,
                'sortname' => 'FJ',
                'name' => 'Fiji Islands',
                'phoneCode' => 679,
            ),
            73 =>
            array (
                'id' => 74,
                'sortname' => 'FI',
                'name' => 'Finland',
                'phoneCode' => 358,
            ),
            74 =>
            array (
                'id' => 75,
                'sortname' => 'FR',
                'name' => 'France',
                'phoneCode' => 33,
            ),
            75 =>
            array (
                'id' => 76,
                'sortname' => 'GF',
                'name' => 'French Guiana',
                'phoneCode' => 594,
            ),
            76 =>
            array (
                'id' => 77,
                'sortname' => 'PF',
                'name' => 'French Polynesia',
                'phoneCode' => 689,
            ),
            77 =>
            array (
                'id' => 78,
                'sortname' => 'TF',
                'name' => 'French Southern Territories',
                'phoneCode' => 0,
            ),
            78 =>
            array (
                'id' => 79,
                'sortname' => 'GA',
                'name' => 'Gabon',
                'phoneCode' => 241,
            ),
            79 =>
            array (
                'id' => 80,
                'sortname' => 'GM',
                'name' => 'Gambia The',
                'phoneCode' => 220,
            ),
            80 =>
            array (
                'id' => 81,
                'sortname' => 'GE',
                'name' => 'Georgia',
                'phoneCode' => 995,
            ),
            81 =>
            array (
                'id' => 82,
                'sortname' => 'DE',
                'name' => 'Germany',
                'phoneCode' => 49,
            ),
            82 =>
            array (
                'id' => 83,
                'sortname' => 'GH',
                'name' => 'Ghana',
                'phoneCode' => 233,
            ),
            83 =>
            array (
                'id' => 84,
                'sortname' => 'GI',
                'name' => 'Gibraltar',
                'phoneCode' => 350,
            ),
            84 =>
            array (
                'id' => 85,
                'sortname' => 'GR',
                'name' => 'Greece',
                'phoneCode' => 30,
            ),
            85 =>
            array (
                'id' => 86,
                'sortname' => 'GL',
                'name' => 'Greenland',
                'phoneCode' => 299,
            ),
            86 =>
            array (
                'id' => 87,
                'sortname' => 'GD',
                'name' => 'Grenada',
                'phoneCode' => 1473,
            ),
            87 =>
            array (
                'id' => 88,
                'sortname' => 'GP',
                'name' => 'Guadeloupe',
                'phoneCode' => 590,
            ),
            88 =>
            array (
                'id' => 89,
                'sortname' => 'GU',
                'name' => 'Guam',
                'phoneCode' => 1671,
            ),
            89 =>
            array (
                'id' => 90,
                'sortname' => 'GT',
                'name' => 'Guatemala',
                'phoneCode' => 502,
            ),
            90 =>
            array (
                'id' => 91,
                'sortname' => 'XU',
                'name' => 'Guernsey and Alderney',
                'phoneCode' => 44,
            ),
            91 =>
            array (
                'id' => 92,
                'sortname' => 'GN',
                'name' => 'Guinea',
                'phoneCode' => 224,
            ),
            92 =>
            array (
                'id' => 93,
                'sortname' => 'GW',
                'name' => 'Guinea-Bissau',
                'phoneCode' => 245,
            ),
            93 =>
            array (
                'id' => 94,
                'sortname' => 'GY',
                'name' => 'Guyana',
                'phoneCode' => 592,
            ),
            94 =>
            array (
                'id' => 95,
                'sortname' => 'HT',
                'name' => 'Haiti',
                'phoneCode' => 509,
            ),
            95 =>
            array (
                'id' => 96,
                'sortname' => 'HM',
                'name' => 'Heard and McDonald Islands',
                'phoneCode' => 0,
            ),
            96 =>
            array (
                'id' => 97,
                'sortname' => 'HN',
                'name' => 'Honduras',
                'phoneCode' => 504,
            ),
            97 =>
            array (
                'id' => 98,
                'sortname' => 'HK',
                'name' => 'Hong Kong S.A.R.',
                'phoneCode' => 852,
            ),
            98 =>
            array (
                'id' => 99,
                'sortname' => 'HU',
                'name' => 'Hungary',
                'phoneCode' => 36,
            ),
            99 =>
            array (
                'id' => 100,
                'sortname' => 'IS',
                'name' => 'Iceland',
                'phoneCode' => 354,
            ),
            100 =>
            array (
                'id' => 101,
                'sortname' => 'IN',
                'name' => 'India',
                'phoneCode' => 91,
            ),
            101 =>
            array (
                'id' => 102,
                'sortname' => 'ID',
                'name' => 'Indonesia',
                'phoneCode' => 62,
            ),
            102 =>
            array (
                'id' => 103,
                'sortname' => 'IR',
                'name' => 'Iran',
                'phoneCode' => 98,
            ),
            103 =>
            array (
                'id' => 104,
                'sortname' => 'IQ',
                'name' => 'Iraq',
                'phoneCode' => 964,
            ),
            104 =>
            array (
                'id' => 105,
                'sortname' => 'IE',
                'name' => 'Ireland',
                'phoneCode' => 353,
            ),
            105 =>
            array (
                'id' => 106,
                'sortname' => 'IL',
                'name' => 'Israel',
                'phoneCode' => 972,
            ),
            106 =>
            array (
                'id' => 107,
                'sortname' => 'IT',
                'name' => 'Italy',
                'phoneCode' => 39,
            ),
            107 =>
            array (
                'id' => 108,
                'sortname' => 'JM',
                'name' => 'Jamaica',
                'phoneCode' => 1876,
            ),
            108 =>
            array (
                'id' => 109,
                'sortname' => 'JP',
                'name' => 'Japan',
                'phoneCode' => 81,
            ),
            109 =>
            array (
                'id' => 110,
                'sortname' => 'XJ',
                'name' => 'Jersey',
                'phoneCode' => 44,
            ),
            110 =>
            array (
                'id' => 111,
                'sortname' => 'JO',
                'name' => 'Jordan',
                'phoneCode' => 962,
            ),
            111 =>
            array (
                'id' => 112,
                'sortname' => 'KZ',
                'name' => 'Kazakhstan',
                'phoneCode' => 7,
            ),
            112 =>
            array (
                'id' => 113,
                'sortname' => 'KE',
                'name' => 'Kenya',
                'phoneCode' => 254,
            ),
            113 =>
            array (
                'id' => 114,
                'sortname' => 'KI',
                'name' => 'Kiribati',
                'phoneCode' => 686,
            ),
            114 =>
            array (
                'id' => 115,
                'sortname' => 'KP',
                'name' => 'Korea North',
                'phoneCode' => 850,
            ),
            115 =>
            array (
                'id' => 116,
                'sortname' => 'KR',
                'name' => 'Korea South',
                'phoneCode' => 82,
            ),
            116 =>
            array (
                'id' => 117,
                'sortname' => 'KW',
                'name' => 'Kuwait',
                'phoneCode' => 965,
            ),
            117 =>
            array (
                'id' => 118,
                'sortname' => 'KG',
                'name' => 'Kyrgyzstan',
                'phoneCode' => 996,
            ),
            118 =>
            array (
                'id' => 119,
                'sortname' => 'LA',
                'name' => 'Laos',
                'phoneCode' => 856,
            ),
            119 =>
            array (
                'id' => 120,
                'sortname' => 'LV',
                'name' => 'Latvia',
                'phoneCode' => 371,
            ),
            120 =>
            array (
                'id' => 121,
                'sortname' => 'LB',
                'name' => 'Lebanon',
                'phoneCode' => 961,
            ),
            121 =>
            array (
                'id' => 122,
                'sortname' => 'LS',
                'name' => 'Lesotho',
                'phoneCode' => 266,
            ),
            122 =>
            array (
                'id' => 123,
                'sortname' => 'LR',
                'name' => 'Liberia',
                'phoneCode' => 231,
            ),
            123 =>
            array (
                'id' => 124,
                'sortname' => 'LY',
                'name' => 'Libya',
                'phoneCode' => 218,
            ),
            124 =>
            array (
                'id' => 125,
                'sortname' => 'LI',
                'name' => 'Liechtenstein',
                'phoneCode' => 423,
            ),
            125 =>
            array (
                'id' => 126,
                'sortname' => 'LT',
                'name' => 'Lithuania',
                'phoneCode' => 370,
            ),
            126 =>
            array (
                'id' => 127,
                'sortname' => 'LU',
                'name' => 'Luxembourg',
                'phoneCode' => 352,
            ),
            127 =>
            array (
                'id' => 128,
                'sortname' => 'MO',
                'name' => 'Macau S.A.R.',
                'phoneCode' => 853,
            ),
            128 =>
            array (
                'id' => 129,
                'sortname' => 'MK',
                'name' => 'Macedonia',
                'phoneCode' => 389,
            ),
            129 =>
            array (
                'id' => 130,
                'sortname' => 'MG',
                'name' => 'Madagascar',
                'phoneCode' => 261,
            ),
            130 =>
            array (
                'id' => 131,
                'sortname' => 'MW',
                'name' => 'Malawi',
                'phoneCode' => 265,
            ),
            131 =>
            array (
                'id' => 132,
                'sortname' => 'MY',
                'name' => 'Malaysia',
                'phoneCode' => 60,
            ),
            132 =>
            array (
                'id' => 133,
                'sortname' => 'MV',
                'name' => 'Maldives',
                'phoneCode' => 960,
            ),
            133 =>
            array (
                'id' => 134,
                'sortname' => 'ML',
                'name' => 'Mali',
                'phoneCode' => 223,
            ),
            134 =>
            array (
                'id' => 135,
                'sortname' => 'MT',
                'name' => 'Malta',
                'phoneCode' => 356,
            ),
            135 =>
            array (
                'id' => 136,
                'sortname' => 'XM',
            'name' => 'Man (Isle of)',
                'phoneCode' => 44,
            ),
            136 =>
            array (
                'id' => 137,
                'sortname' => 'MH',
                'name' => 'Marshall Islands',
                'phoneCode' => 692,
            ),
            137 =>
            array (
                'id' => 138,
                'sortname' => 'MQ',
                'name' => 'Martinique',
                'phoneCode' => 596,
            ),
            138 =>
            array (
                'id' => 139,
                'sortname' => 'MR',
                'name' => 'Mauritania',
                'phoneCode' => 222,
            ),
            139 =>
            array (
                'id' => 140,
                'sortname' => 'MU',
                'name' => 'Mauritius',
                'phoneCode' => 230,
            ),
            140 =>
            array (
                'id' => 141,
                'sortname' => 'YT',
                'name' => 'Mayotte',
                'phoneCode' => 269,
            ),
            141 =>
            array (
                'id' => 142,
                'sortname' => 'MX',
                'name' => 'Mexico',
                'phoneCode' => 52,
            ),
            142 =>
            array (
                'id' => 143,
                'sortname' => 'FM',
                'name' => 'Micronesia',
                'phoneCode' => 691,
            ),
            143 =>
            array (
                'id' => 144,
                'sortname' => 'MD',
                'name' => 'Moldova',
                'phoneCode' => 373,
            ),
            144 =>
            array (
                'id' => 145,
                'sortname' => 'MC',
                'name' => 'Monaco',
                'phoneCode' => 377,
            ),
            145 =>
            array (
                'id' => 146,
                'sortname' => 'MN',
                'name' => 'Mongolia',
                'phoneCode' => 976,
            ),
            146 =>
            array (
                'id' => 147,
                'sortname' => 'MS',
                'name' => 'Montserrat',
                'phoneCode' => 1664,
            ),
            147 =>
            array (
                'id' => 148,
                'sortname' => 'MA',
                'name' => 'Morocco',
                'phoneCode' => 212,
            ),
            148 =>
            array (
                'id' => 149,
                'sortname' => 'MZ',
                'name' => 'Mozambique',
                'phoneCode' => 258,
            ),
            149 =>
            array (
                'id' => 150,
                'sortname' => 'MM',
                'name' => 'Myanmar',
                'phoneCode' => 95,
            ),
            150 =>
            array (
                'id' => 151,
                'sortname' => 'NA',
                'name' => 'Namibia',
                'phoneCode' => 264,
            ),
            151 =>
            array (
                'id' => 152,
                'sortname' => 'NR',
                'name' => 'Nauru',
                'phoneCode' => 674,
            ),
            152 =>
            array (
                'id' => 153,
                'sortname' => 'NP',
                'name' => 'Nepal',
                'phoneCode' => 977,
            ),
            153 =>
            array (
                'id' => 154,
                'sortname' => 'AN',
                'name' => 'Netherlands Antilles',
                'phoneCode' => 599,
            ),
            154 =>
            array (
                'id' => 155,
                'sortname' => 'NL',
                'name' => 'Netherlands The',
                'phoneCode' => 31,
            ),
            155 =>
            array (
                'id' => 156,
                'sortname' => 'NC',
                'name' => 'New Caledonia',
                'phoneCode' => 687,
            ),
            156 =>
            array (
                'id' => 157,
                'sortname' => 'NZ',
                'name' => 'New Zealand',
                'phoneCode' => 64,
            ),
            157 =>
            array (
                'id' => 158,
                'sortname' => 'NI',
                'name' => 'Nicaragua',
                'phoneCode' => 505,
            ),
            158 =>
            array (
                'id' => 159,
                'sortname' => 'NE',
                'name' => 'Niger',
                'phoneCode' => 227,
            ),
            159 =>
            array (
                'id' => 160,
                'sortname' => 'NG',
                'name' => 'Nigeria',
                'phoneCode' => 234,
            ),
            160 =>
            array (
                'id' => 161,
                'sortname' => 'NU',
                'name' => 'Niue',
                'phoneCode' => 683,
            ),
            161 =>
            array (
                'id' => 162,
                'sortname' => 'NF',
                'name' => 'Norfolk Island',
                'phoneCode' => 672,
            ),
            162 =>
            array (
                'id' => 163,
                'sortname' => 'MP',
                'name' => 'Northern Mariana Islands',
                'phoneCode' => 1670,
            ),
            163 =>
            array (
                'id' => 164,
                'sortname' => 'NO',
                'name' => 'Norway',
                'phoneCode' => 47,
            ),
            164 =>
            array (
                'id' => 165,
                'sortname' => 'OM',
                'name' => 'Oman',
                'phoneCode' => 968,
            ),
            165 =>
            array (
                'id' => 166,
                'sortname' => 'PK',
                'name' => 'Pakistan',
                'phoneCode' => 92,
            ),
            166 =>
            array (
                'id' => 167,
                'sortname' => 'PW',
                'name' => 'Palau',
                'phoneCode' => 680,
            ),
            167 =>
            array (
                'id' => 168,
                'sortname' => 'PS',
                'name' => 'Palestinian Territory Occupied',
                'phoneCode' => 970,
            ),
            168 =>
            array (
                'id' => 169,
                'sortname' => 'PA',
                'name' => 'Panama',
                'phoneCode' => 507,
            ),
            169 =>
            array (
                'id' => 170,
                'sortname' => 'PG',
                'name' => 'Papua new Guinea',
                'phoneCode' => 675,
            ),
            170 =>
            array (
                'id' => 171,
                'sortname' => 'PY',
                'name' => 'Paraguay',
                'phoneCode' => 595,
            ),
            171 =>
            array (
                'id' => 172,
                'sortname' => 'PE',
                'name' => 'Peru',
                'phoneCode' => 51,
            ),
            172 =>
            array (
                'id' => 173,
                'sortname' => 'PH',
                'name' => 'Philippines',
                'phoneCode' => 63,
            ),
            173 =>
            array (
                'id' => 174,
                'sortname' => 'PN',
                'name' => 'Pitcairn Island',
                'phoneCode' => 0,
            ),
            174 =>
            array (
                'id' => 175,
                'sortname' => 'PL',
                'name' => 'Poland',
                'phoneCode' => 48,
            ),
            175 =>
            array (
                'id' => 176,
                'sortname' => 'PT',
                'name' => 'Portugal',
                'phoneCode' => 351,
            ),
            176 =>
            array (
                'id' => 177,
                'sortname' => 'PR',
                'name' => 'Puerto Rico',
                'phoneCode' => 1787,
            ),
            177 =>
            array (
                'id' => 178,
                'sortname' => 'QA',
                'name' => 'Qatar',
                'phoneCode' => 974,
            ),
            178 =>
            array (
                'id' => 179,
                'sortname' => 'RE',
                'name' => 'Reunion',
                'phoneCode' => 262,
            ),
            179 =>
            array (
                'id' => 180,
                'sortname' => 'RO',
                'name' => 'Romania',
                'phoneCode' => 40,
            ),
            180 =>
            array (
                'id' => 181,
                'sortname' => 'RU',
                'name' => 'Russia',
                'phoneCode' => 70,
            ),
            181 =>
            array (
                'id' => 182,
                'sortname' => 'RW',
                'name' => 'Rwanda',
                'phoneCode' => 250,
            ),
            182 =>
            array (
                'id' => 183,
                'sortname' => 'SH',
                'name' => 'Saint Helena',
                'phoneCode' => 290,
            ),
            183 =>
            array (
                'id' => 184,
                'sortname' => 'KN',
                'name' => 'Saint Kitts And Nevis',
                'phoneCode' => 1869,
            ),
            184 =>
            array (
                'id' => 185,
                'sortname' => 'LC',
                'name' => 'Saint Lucia',
                'phoneCode' => 1758,
            ),
            185 =>
            array (
                'id' => 186,
                'sortname' => 'PM',
                'name' => 'Saint Pierre and Miquelon',
                'phoneCode' => 508,
            ),
            186 =>
            array (
                'id' => 187,
                'sortname' => 'VC',
                'name' => 'Saint Vincent And The Grenadines',
                'phoneCode' => 1784,
            ),
            187 =>
            array (
                'id' => 188,
                'sortname' => 'WS',
                'name' => 'Samoa',
                'phoneCode' => 684,
            ),
            188 =>
            array (
                'id' => 189,
                'sortname' => 'SM',
                'name' => 'San Marino',
                'phoneCode' => 378,
            ),
            189 =>
            array (
                'id' => 190,
                'sortname' => 'ST',
                'name' => 'Sao Tome and Principe',
                'phoneCode' => 239,
            ),
            190 =>
            array (
                'id' => 191,
                'sortname' => 'SA',
                'name' => 'Saudi Arabia',
                'phoneCode' => 966,
            ),
            191 =>
            array (
                'id' => 192,
                'sortname' => 'SN',
                'name' => 'Senegal',
                'phoneCode' => 221,
            ),
            192 =>
            array (
                'id' => 193,
                'sortname' => 'RS',
                'name' => 'Serbia',
                'phoneCode' => 381,
            ),
            193 =>
            array (
                'id' => 194,
                'sortname' => 'SC',
                'name' => 'Seychelles',
                'phoneCode' => 248,
            ),
            194 =>
            array (
                'id' => 195,
                'sortname' => 'SL',
                'name' => 'Sierra Leone',
                'phoneCode' => 232,
            ),
            195 =>
            array (
                'id' => 196,
                'sortname' => 'SG',
                'name' => 'Singapore',
                'phoneCode' => 65,
            ),
            196 =>
            array (
                'id' => 197,
                'sortname' => 'SK',
                'name' => 'Slovakia',
                'phoneCode' => 421,
            ),
            197 =>
            array (
                'id' => 198,
                'sortname' => 'SI',
                'name' => 'Slovenia',
                'phoneCode' => 386,
            ),
            198 =>
            array (
                'id' => 199,
                'sortname' => 'XG',
                'name' => 'Smaller Territories of the UK',
                'phoneCode' => 44,
            ),
            199 =>
            array (
                'id' => 200,
                'sortname' => 'SB',
                'name' => 'Solomon Islands',
                'phoneCode' => 677,
            ),
            200 =>
            array (
                'id' => 201,
                'sortname' => 'SO',
                'name' => 'Somalia',
                'phoneCode' => 252,
            ),
            201 =>
            array (
                'id' => 202,
                'sortname' => 'ZA',
                'name' => 'South Africa',
                'phoneCode' => 27,
            ),
            202 =>
            array (
                'id' => 203,
                'sortname' => 'GS',
                'name' => 'South Georgia',
                'phoneCode' => 0,
            ),
            203 =>
            array (
                'id' => 204,
                'sortname' => 'SS',
                'name' => 'South Sudan',
                'phoneCode' => 211,
            ),
            204 =>
            array (
                'id' => 205,
                'sortname' => 'ES',
                'name' => 'Spain',
                'phoneCode' => 34,
            ),
            205 =>
            array (
                'id' => 206,
                'sortname' => 'LK',
                'name' => 'Sri Lanka',
                'phoneCode' => 94,
            ),
            206 =>
            array (
                'id' => 207,
                'sortname' => 'SD',
                'name' => 'Sudan',
                'phoneCode' => 249,
            ),
            207 =>
            array (
                'id' => 208,
                'sortname' => 'SR',
                'name' => 'Suriname',
                'phoneCode' => 597,
            ),
            208 =>
            array (
                'id' => 209,
                'sortname' => 'SJ',
                'name' => 'Svalbard And Jan Mayen Islands',
                'phoneCode' => 47,
            ),
            209 =>
            array (
                'id' => 210,
                'sortname' => 'SZ',
                'name' => 'Swaziland',
                'phoneCode' => 268,
            ),
            210 =>
            array (
                'id' => 211,
                'sortname' => 'SE',
                'name' => 'Sweden',
                'phoneCode' => 46,
            ),
            211 =>
            array (
                'id' => 212,
                'sortname' => 'CH',
                'name' => 'Switzerland',
                'phoneCode' => 41,
            ),
            212 =>
            array (
                'id' => 213,
                'sortname' => 'SY',
                'name' => 'Syria',
                'phoneCode' => 963,
            ),
            213 =>
            array (
                'id' => 214,
                'sortname' => 'TW',
                'name' => 'Taiwan',
                'phoneCode' => 886,
            ),
            214 =>
            array (
                'id' => 215,
                'sortname' => 'TJ',
                'name' => 'Tajikistan',
                'phoneCode' => 992,
            ),
            215 =>
            array (
                'id' => 216,
                'sortname' => 'TZ',
                'name' => 'Tanzania',
                'phoneCode' => 255,
            ),
            216 =>
            array (
                'id' => 217,
                'sortname' => 'TH',
                'name' => 'Thailand',
                'phoneCode' => 66,
            ),
            217 =>
            array (
                'id' => 218,
                'sortname' => 'TG',
                'name' => 'Togo',
                'phoneCode' => 228,
            ),
            218 =>
            array (
                'id' => 219,
                'sortname' => 'TK',
                'name' => 'Tokelau',
                'phoneCode' => 690,
            ),
            219 =>
            array (
                'id' => 220,
                'sortname' => 'TO',
                'name' => 'Tonga',
                'phoneCode' => 676,
            ),
            220 =>
            array (
                'id' => 221,
                'sortname' => 'TT',
                'name' => 'Trinidad And Tobago',
                'phoneCode' => 1868,
            ),
            221 =>
            array (
                'id' => 222,
                'sortname' => 'TN',
                'name' => 'Tunisia',
                'phoneCode' => 216,
            ),
            222 =>
            array (
                'id' => 223,
                'sortname' => 'TR',
                'name' => 'Turkey',
                'phoneCode' => 90,
            ),
            223 =>
            array (
                'id' => 224,
                'sortname' => 'TM',
                'name' => 'Turkmenistan',
                'phoneCode' => 7370,
            ),
            224 =>
            array (
                'id' => 225,
                'sortname' => 'TC',
                'name' => 'Turks And Caicos Islands',
                'phoneCode' => 1649,
            ),
            225 =>
            array (
                'id' => 226,
                'sortname' => 'TV',
                'name' => 'Tuvalu',
                'phoneCode' => 688,
            ),
            226 =>
            array (
                'id' => 227,
                'sortname' => 'UG',
                'name' => 'Uganda',
                'phoneCode' => 256,
            ),
            227 =>
            array (
                'id' => 228,
                'sortname' => 'UA',
                'name' => 'Ukraine',
                'phoneCode' => 380,
            ),
            228 =>
            array (
                'id' => 229,
                'sortname' => 'AE',
                'name' => 'United Arab Emirates',
                'phoneCode' => 971,
            ),
            229 =>
            array (
                'id' => 230,
                'sortname' => 'GB',
                'name' => 'United Kingdom',
                'phoneCode' => 44,
            ),
            230 =>
            array (
                'id' => 231,
                'sortname' => 'US',
                'name' => 'United States',
                'phoneCode' => 1,
            ),
            231 =>
            array (
                'id' => 232,
                'sortname' => 'UM',
                'name' => 'United States Minor Outlying Islands',
                'phoneCode' => 1,
            ),
            232 =>
            array (
                'id' => 233,
                'sortname' => 'UY',
                'name' => 'Uruguay',
                'phoneCode' => 598,
            ),
            233 =>
            array (
                'id' => 234,
                'sortname' => 'UZ',
                'name' => 'Uzbekistan',
                'phoneCode' => 998,
            ),
            234 =>
            array (
                'id' => 235,
                'sortname' => 'VU',
                'name' => 'Vanuatu',
                'phoneCode' => 678,
            ),
            235 =>
            array (
                'id' => 236,
                'sortname' => 'VA',
            'name' => 'Vatican City State (Holy See)',
                'phoneCode' => 39,
            ),
            236 =>
            array (
                'id' => 237,
                'sortname' => 'VE',
                'name' => 'Venezuela',
                'phoneCode' => 58,
            ),
            237 =>
            array (
                'id' => 238,
                'sortname' => 'VN',
                'name' => 'Vietnam',
                'phoneCode' => 84,
            ),
            238 =>
            array (
                'id' => 239,
                'sortname' => 'VG',
            'name' => 'Virgin Islands (British)',
                'phoneCode' => 1284,
            ),
            239 =>
            array (
                'id' => 240,
                'sortname' => 'VI',
            'name' => 'Virgin Islands (US)',
                'phoneCode' => 1340,
            ),
            240 =>
            array (
                'id' => 241,
                'sortname' => 'WF',
                'name' => 'Wallis And Futuna Islands',
                'phoneCode' => 681,
            ),
            241 =>
            array (
                'id' => 242,
                'sortname' => 'EH',
                'name' => 'Western Sahara',
                'phoneCode' => 212,
            ),
            242 =>
            array (
                'id' => 243,
                'sortname' => 'YE',
                'name' => 'Yemen',
                'phoneCode' => 967,
            ),
            243 =>
            array (
                'id' => 244,
                'sortname' => 'YU',
                'name' => 'Yugoslavia',
                'phoneCode' => 38,
            ),
            244 =>
            array (
                'id' => 245,
                'sortname' => 'ZM',
                'name' => 'Zambia',
                'phoneCode' => 260,
            ),
            245 =>
            array (
                'id' => 246,
                'sortname' => 'ZW',
                'name' => 'Zimbabwe',
                'phoneCode' => 26,
            ),
        ));


    }
}
