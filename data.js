/**
 * TDR業務MAP - マスターデータ定義 (data.js)
 * デベロッパー管理コンソールより自動同期 (2026/10/25 15:45:27)
 */

const RESORT_DATA = {
  "initialView": {
    "center": [
      35.63,
      139.882
    ],
    "zoom": 15,
    "minZoom": 13,
    "maxZoom": 20
  },
  "parks": [
    {
      "id": "tdl",
      "name": "東京ディズニーランド（TDL）",
      "shortName": "TDL",
      "color": "#f59e0b",
      "center": [
        35.6329,
        139.8804
      ],
      "zoom": 16,
      "polygon": [
        [
          35.638639,
          139.876986
        ],
        [
          35.636895,
          139.881561
        ],
        [
          35.630824,
          139.888771
        ],
        [
          35.628544,
          139.885793
        ],
        [
          35.629022,
          139.882506
        ],
        [
          35.629926,
          139.878402
        ],
        [
          35.630043,
          139.87799
        ],
        [
          35.630201,
          139.877703
        ],
        [
          35.630745,
          139.877173
        ],
        [
          35.63092,
          139.877037
        ],
        [
          35.632919,
          139.872866
        ],
        [
          35.637261,
          139.875505
        ]
      ],
      "description": "テーマランド全7エリアおよび周辺バックヤード保守工区",
      "code": "tdl",
      "fillColor": "#f59e0b",
      "fillOpacity": 0.25
    },
    {
      "id": "tds",
      "name": "東京ディズニーシー（TDS）",
      "shortName": "TDS",
      "color": "#0284c7",
      "center": [
        35.6265,
        139.8845
      ],
      "zoom": 16,
      "polygon": [
        [
          35.628955,
          139.882508
        ],
        [
          35.628499,
          139.885805
        ],
        [
          35.629984,
          139.887756
        ],
        [
          35.626431,
          139.892038
        ],
        [
          35.624763,
          139.890045
        ],
        [
          35.624024,
          139.889184
        ],
        [
          35.623503,
          139.888565
        ],
        [
          35.623291,
          139.888317
        ],
        [
          35.623187,
          139.888188
        ],
        [
          35.623096,
          139.888052
        ],
        [
          35.62301,
          139.887873
        ],
        [
          35.622958,
          139.887704
        ],
        [
          35.622917,
          139.88752
        ],
        [
          35.6229,
          139.887332
        ],
        [
          35.622892,
          139.887186
        ],
        [
          35.622899,
          139.887014
        ],
        [
          35.622924,
          139.886819
        ],
        [
          35.622978,
          139.88658
        ],
        [
          35.623176,
          139.88572
        ],
        [
          35.623574,
          139.884
        ],
        [
          35.624349,
          139.88066
        ],
        [
          35.624414,
          139.880456
        ],
        [
          35.624486,
          139.880322
        ],
        [
          35.624623,
          139.880167
        ],
        [
          35.624798,
          139.880011
        ],
        [
          35.624968,
          139.879928
        ],
        [
          35.625144,
          139.879882
        ],
        [
          35.625434,
          139.879901
        ],
        [
          35.625737,
          139.87999
        ],
        [
          35.625993,
          139.880065
        ],
        [
          35.626152,
          139.880105
        ],
        [
          35.626322,
          139.880116
        ],
        [
          35.626498,
          139.880089
        ],
        [
          35.626677,
          139.880022
        ],
        [
          35.626841,
          139.879928
        ],
        [
          35.627019,
          139.879805
        ],
        [
          35.627096,
          139.879716
        ],
        [
          35.627183,
          139.879585
        ],
        [
          35.627292,
          139.879453
        ],
        [
          35.627377,
          139.879273
        ],
        [
          35.628358,
          139.875028
        ],
        [
          35.629309,
          139.875017
        ],
        [
          35.630674,
          139.876855
        ],
        [
          35.630686,
          139.877157
        ],
        [
          35.62998,
          139.877876
        ]
      ],
      "description": "テーマポート全8エリアおよび外周バックヤード保守工区",
      "code": "tds",
      "fillColor": "#0284c7",
      "fillOpacity": 0.25
    }
  ],
  "areas": [
    {
      "id": "tdl-tomorrow",
      "parkId": "tdl",
      "name": "トゥモローランド＆北側バックヤード工区",
      "code": "TDL-TOMORROW",
      "color": "#3b82f6",
      "fillColor": "#60a5fa",
      "fillOpacity": 0.25,
      "center": [
        35.6338,
        139.8828
      ],
      "zoom": 17,
      "polygon": [
        [
          35.6345,
          139.8815
        ],
        [
          35.636,
          139.8845
        ],
        [
          35.6332,
          139.8858
        ],
        [
          35.6318,
          139.883
        ],
        [
          35.6325,
          139.8812
        ]
      ]
    },
    {
      "id": "tdl-center-energy",
      "parkId": "tdl",
      "name": "中央エネルギーセンター＆管理棟工区",
      "code": "TDL-ENERGY",
      "color": "#f59e0b",
      "fillColor": "#fbbf24",
      "fillOpacity": 0.25,
      "center": [
        35.6358,
        139.8795
      ],
      "zoom": 17,
      "polygon": [
        [
          35.6355,
          139.8775
        ],
        [
          35.6375,
          139.8812
        ],
        [
          35.6358,
          139.8822
        ],
        [
          35.6342,
          139.8785
        ]
      ]
    },
    {
      "id": "tdl-fantasy",
      "parkId": "tdl",
      "name": "ファンタジーランド＆飲食セントラルキッチン工区",
      "code": "TDL-FANTASY",
      "color": "#10b981",
      "fillColor": "#34d399",
      "fillOpacity": 0.25,
      "center": [
        35.6325,
        139.8775
      ],
      "zoom": 17,
      "polygon": [
        [
          35.632,
          139.8755
        ],
        [
          35.6345,
          139.8768
        ],
        [
          35.6338,
          139.8798
        ],
        [
          35.6312,
          139.8788
        ]
      ]
    },
    {
      "id": "tds-mediterranean",
      "parkId": "tds",
      "name": "メディテレーニアンハーバー",
      "code": "TDS-Mediterranean-Harbor",
      "color": "#7b110a",
      "fillColor": "#7b110a",
      "fillOpacity": 0.25,
      "center": [
        35.628,
        139.8845
      ],
      "zoom": 17,
      "polygon": [
        [
          35.626928,
          139.885
        ],
        [
          35.627137,
          139.885359
        ],
        [
          35.62758,
          139.884997
        ],
        [
          35.627734,
          139.885268
        ],
        [
          35.627828,
          139.885196
        ],
        [
          35.628059,
          139.885416
        ],
        [
          35.628144,
          139.885569
        ],
        [
          35.628146,
          139.88581
        ],
        [
          35.627586,
          139.885791
        ],
        [
          35.627585,
          139.886006
        ],
        [
          35.627281,
          139.886389
        ],
        [
          35.627368,
          139.886647
        ],
        [
          35.627246,
          139.886861
        ],
        [
          35.627128,
          139.887194
        ],
        [
          35.627342,
          139.887929
        ],
        [
          35.626566,
          139.888256
        ],
        [
          35.626392,
          139.888739
        ],
        [
          35.625945,
          139.888946
        ],
        [
          35.625397,
          139.887757
        ],
        [
          35.625044,
          139.885413
        ],
        [
          35.62521,
          139.884981
        ],
        [
          35.625319,
          139.884962
        ],
        [
          35.625474,
          139.885048
        ],
        [
          35.625914,
          139.884928
        ],
        [
          35.626191,
          139.885118
        ],
        [
          35.626544,
          139.885156
        ]
      ],
      "description": ""
    },
    {
      "id": "area-custom_90830",
      "parkId": "tds",
      "name": "パークエントランス",
      "code": "TDS-entrance",
      "color": "#f59e0b",
      "fillColor": "#f59e0b",
      "fillOpacity": 0.25,
      "center": [
        35.626801,
        139.889045
      ],
      "zoom": 17,
      "polygon": [
        [
          35.625999,
          139.889125
        ],
        [
          35.626426,
          139.888873
        ],
        [
          35.626596,
          139.888326
        ],
        [
          35.627124,
          139.888095
        ],
        [
          35.627521,
          139.888101
        ],
        [
          35.627896,
          139.887918
        ],
        [
          35.628179,
          139.88757
        ],
        [
          35.628707,
          139.887334
        ],
        [
          35.629501,
          139.888339
        ],
        [
          35.628794,
          139.888219
        ],
        [
          35.626326,
          139.891276
        ],
        [
          35.625698,
          139.890697
        ],
        [
          35.626239,
          139.889474
        ]
      ],
      "description": ""
    },
    {
      "id": "area-custom_52376",
      "parkId": "tds",
      "name": "アメリカンウォーターフロント",
      "code": "TDS-American-Waterfront",
      "color": "#ff0000",
      "fillColor": "#ff0000",
      "fillOpacity": 0.25,
      "center": [
        35.624363,
        139.887271
      ],
      "zoom": 17,
      "polygon": [
        [
          35.625352,
          139.887781
        ],
        [
          35.625646,
          139.888471
        ],
        [
          35.624621,
          139.889635
        ],
        [
          35.6232,
          139.887913
        ],
        [
          35.62303,
          139.887092
        ],
        [
          35.623671,
          139.884405
        ],
        [
          35.625101,
          139.884362
        ],
        [
          35.625123,
          139.884946
        ],
        [
          35.624992,
          139.885389
        ]
      ],
      "description": ""
    },
    {
      "id": "area-custom_61155",
      "parkId": "tds",
      "name": "ミステリアスアイランド",
      "code": "TDS-Mysterious-Island",
      "color": "#06b6d4",
      "fillColor": "#06b6d4",
      "fillOpacity": 0.25,
      "center": [
        35.626379,
        139.88401
      ],
      "zoom": 17,
      "polygon": [
        [
          35.627115,
          139.884042
        ],
        [
          35.627161,
          139.884549
        ],
        [
          35.627037,
          139.884946
        ],
        [
          35.626882,
          139.884944
        ],
        [
          35.626629,
          139.885062
        ],
        [
          35.626386,
          139.885095
        ],
        [
          35.626206,
          139.885074
        ],
        [
          35.625856,
          139.884815
        ],
        [
          35.625489,
          139.884922
        ],
        [
          35.625317,
          139.884785
        ],
        [
          35.625332,
          139.884394
        ],
        [
          35.625567,
          139.884077
        ],
        [
          35.626239,
          139.883616
        ]
      ],
      "description": ""
    },
    {
      "id": "area-custom_41866",
      "parkId": "tds",
      "name": "ポートディスカバリー",
      "code": "TDS-Port-Discovery",
      "color": "#f59e0b",
      "fillColor": "#f59e0b",
      "fillOpacity": 0.25,
      "center": [
        35.624754,
        139.883605
      ],
      "zoom": 17,
      "polygon": [
        [
          35.624591,
          139.88227
        ],
        [
          35.625506,
          139.881873
        ],
        [
          35.625615,
          139.88227
        ],
        [
          35.625456,
          139.883766
        ],
        [
          35.625345,
          139.883954
        ],
        [
          35.625192,
          139.883922
        ],
        [
          35.62492,
          139.884316
        ],
        [
          35.624023,
          139.884342
        ]
      ],
      "description": ""
    },
    {
      "id": "area-custom_37621",
      "parkId": "tds",
      "name": "マーメイドラグーン",
      "code": "TDS-Mermaid-Lagoon",
      "color": "#ec4899",
      "fillColor": "#ec4899",
      "fillOpacity": 0.25,
      "center": [
        35.626464,
        139.882975
      ],
      "zoom": 17,
      "polygon": [
        [
          35.626185,
          139.882428
        ],
        [
          35.626073,
          139.882661
        ],
        [
          35.62603,
          139.883369
        ],
        [
          35.627464,
          139.884029
        ],
        [
          35.627567,
          139.883675
        ],
        [
          35.627848,
          139.883316
        ],
        [
          35.627521,
          139.883021
        ],
        [
          35.627501,
          139.882911
        ],
        [
          35.627669,
          139.882296
        ],
        [
          35.627558,
          139.882068
        ],
        [
          35.627375,
          139.881915
        ],
        [
          35.627185,
          139.882119
        ],
        [
          35.627107,
          139.882114
        ],
        [
          35.62691,
          139.882318
        ]
      ],
      "description": ""
    },
    {
      "id": "area-custom_18380",
      "parkId": "tds",
      "name": "ロストリバーデルタ",
      "code": "TDS-Lost-River-Delta",
      "color": "#1fa836",
      "fillColor": "#1fa836",
      "fillOpacity": 0.25,
      "center": [
        35.626805,
        139.881208
      ],
      "zoom": 17,
      "polygon": [
        [
          35.626424,
          139.880208
        ],
        [
          35.627102,
          139.87996
        ],
        [
          35.628131,
          139.880344
        ],
        [
          35.627948,
          139.880826
        ],
        [
          35.627898,
          139.881328
        ],
        [
          35.627418,
          139.881602
        ],
        [
          35.627373,
          139.881859
        ],
        [
          35.62688,
          139.882253
        ],
        [
          35.626145,
          139.882371
        ],
        [
          35.62601,
          139.882658
        ],
        [
          35.625971,
          139.882999
        ],
        [
          35.625572,
          139.882952
        ],
        [
          35.625655,
          139.882213
        ],
        [
          35.625552,
          139.881846
        ],
        [
          35.625524,
          139.880679
        ]
      ],
      "description": ""
    },
    {
      "id": "area-custom_89618",
      "parkId": "tds",
      "name": "アラビアンコースト",
      "code": "TDS-Arabian-Coast",
      "color": "#8b5cf6",
      "fillColor": "#8b5cf6",
      "fillOpacity": 0.25,
      "center": [
        35.628506,
        139.882217
      ],
      "zoom": 17,
      "polygon": [
        [
          35.627852,
          139.883495
        ],
        [
          35.628746,
          139.883686
        ],
        [
          35.629104,
          139.880993
        ],
        [
          35.628254,
          139.880832
        ],
        [
          35.627846,
          139.88191
        ],
        [
          35.627569,
          139.882956
        ],
        [
          35.627885,
          139.883279
        ]
      ],
      "description": ""
    },
    {
      "id": "area-custom_56342",
      "parkId": "tds",
      "name": "ファンタジースプリングス",
      "code": "TDS-Fantasy-Springs",
      "color": "#0783a2",
      "fillColor": "#0783a2",
      "fillOpacity": 0.25,
      "center": [
        35.628595,
        139.878882
      ],
      "zoom": 17,
      "polygon": [
        [
          35.62821,
          139.880671
        ],
        [
          35.628206,
          139.880317
        ],
        [
          35.627901,
          139.880106
        ],
        [
          35.628029,
          139.879534
        ],
        [
          35.627455,
          139.879346
        ],
        [
          35.627844,
          139.877597
        ],
        [
          35.628153,
          139.877605
        ],
        [
          35.62831,
          139.876953
        ],
        [
          35.628515,
          139.876792
        ],
        [
          35.629254,
          139.876809
        ],
        [
          35.629496,
          139.877096
        ],
        [
          35.630106,
          139.87639
        ],
        [
          35.63063,
          139.877066
        ],
        [
          35.629755,
          139.878091
        ],
        [
          35.629773,
          139.878286
        ],
        [
          35.629264,
          139.879957
        ],
        [
          35.628587,
          139.879735
        ],
        [
          35.62857,
          139.880336
        ],
        [
          35.628378,
          139.880759
        ]
      ],
      "description": ""
    }
  ],
  "facilities": [
    {
      "id": "fac-tdl-space",
      "areaId": "tdl-tomorrow",
      "name": "スペースライド ドーム棟",
      "category": "アトラクション",
      "code": "FAC-T101",
      "color": "#3b82f6",
      "fillColor": "#93c5fd",
      "lat": 35.6335,
      "lng": 139.8836,
      "polygon": [
        [
          35.6338,
          139.8832
        ],
        [
          35.6338,
          139.8842
        ],
        [
          35.6331,
          139.8842
        ],
        [
          35.6331,
          139.8832
        ]
      ],
      "description": "大型ドーム型ジェットコースター施設。客席大空間および屋上チラー室外機ヤードあり。",
      "equipments": [
        {
          "id": "EQ-101-01",
          "floor": "RF（屋上）",
          "entrance": {
            "name": "北側 避難階段・屋上アクセスハッチ",
            "lat": 35.63385,
            "lng": 139.8834,
            "photoUrl": "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80",
            "photoCaption": "北側外壁沿いの螺旋鉄骨階段を昇り、屋上防音扉を開けます（キー番号：K-104）。"
          },
          "roomName": "北側 屋上室外機ヤード",
          "hvacType": "ビル用マルチエアコン室外機",
          "indoorUnitsCount": 4,
          "needSecurityKey": true,
          "securityNote": "要セキュリティ開錠（中央防災センターでK-104借受）",
          "notes": "🪜 6尺脚立持参。ファンケーシング点検用トルクスT20必要。冷媒R410A。",
          "completed": false,
          "maintTarget": true,
          "maintPeriod": "2026年度 (4月〜3月)",
          "maintStatus": "pending",
          "maintNote": "🪜 6尺脚立持参。ファンケーシング点検用トルクスT20必要。冷媒R410A。",
          "filterTarget": true,
          "filterQuarter": "第3四半期 (10〜12月)",
          "filterSpec": "中性能プレフィルター 595×595×50mm × 6枚",
          "filterToolNote": "🪜 6尺脚立持参。ファンケーシング点検用トルクスT20必要。冷媒R410A。",
          "filterStatus": "pending",
          "repairActive": true,
          "repairRequestNo": "OLC-26-1041",
          "repairDate": "2026/10/24",
          "repairSymptom": "異音発生（ファン軸受より金属音・OLC施設管理課より点検依頼）",
          "repairAction": "Vベルトおよびベアリング交換要",
          "repairStatus": "pending"
        },
        {
          "id": "EQ-101-02",
          "floor": "2F",
          "entrance": {
            "name": "西側 キャスト通用口（カードリーダー）",
            "lat": 35.6333,
            "lng": 139.8831,
            "photoUrl": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
            "photoCaption": "西側通路奥の青い扉。IDカードタッチで開錠します。"
          },
          "roomName": "アトラクション主制御室（電算室）",
          "hvacType": "高顕熱精密空調機",
          "indoorUnitsCount": 2,
          "needSecurityKey": true,
          "securityNote": "要セキュリティ開錠（キャストリーダー立ち会い要）",
          "notes": "24時間連続運転系統。フィルタ清掃時は予備機へ自動切替後作業のこと。",
          "completed": false,
          "maintTarget": true,
          "maintPeriod": "2026年度 (4月〜3月)",
          "maintStatus": "pending",
          "maintNote": "24時間連続運転系統。フィルタ清掃時は予備機へ自動切替後作業のこと。",
          "filterTarget": true,
          "filterQuarter": "第3四半期 (10〜12月)",
          "filterSpec": "高性能フィルター 610×610×150mm × 2枚",
          "filterToolNote": "24時間連続運転系統。フィルタ清掃時は予備機へ自動切替後作業のこと。",
          "filterStatus": "pending",
          "repairActive": false,
          "repairRequestNo": "",
          "repairDate": "",
          "repairSymptom": "",
          "repairAction": "",
          "repairStatus": "done"
        },
        {
          "id": "EQ-101-03",
          "floor": "2F",
          "entrance": {
            "name": "西側 キャスト通用口（カードリーダー）",
            "lat": 35.6333,
            "lng": 139.8831,
            "photoUrl": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
            "photoCaption": "西側通路奥の青い扉。IDカードタッチで開錠します。"
          },
          "roomName": "キャスト控室・更衣室",
          "hvacType": "天井カセット型4方向室内機",
          "indoorUnitsCount": 3,
          "needSecurityKey": false,
          "securityNote": "開錠不要（常時開放）",
          "notes": "🪜 4尺脚立で作業可能。ドレンパン防カビタブレット投入。",
          "completed": true,
          "maintTarget": true,
          "maintPeriod": "2026年度 (4月〜3月)",
          "maintStatus": "done",
          "maintNote": "🪜 4尺脚立で作業可能。ドレンパン防カビタブレット投入。",
          "filterTarget": true,
          "filterQuarter": "第3四半期 (10〜12月)",
          "filterSpec": "4方向カセット標準フィルター 520×520mm × 3枚",
          "filterToolNote": "🪜 4尺脚立で作業可能。ドレンパン防カビタブレット投入。",
          "filterStatus": "done",
          "repairActive": false,
          "repairRequestNo": "",
          "repairDate": "",
          "repairSymptom": "",
          "repairAction": "",
          "repairStatus": "done"
        },
        {
          "id": "EQ-101-04",
          "floor": "1F",
          "entrance": {
            "name": "東側 ゲストキューライン保守扉",
            "lat": 35.6334,
            "lng": 139.8841,
            "photoUrl": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
            "photoCaption": "キューライン第3通路沿いの隠し点検扉。パーク閉園後のみ入室可能。"
          },
          "roomName": "1F プラットホーム誘導ホール",
          "hvacType": "大空間エアハンドリングユニット（AHU）",
          "indoorUnitsCount": 2,
          "needSecurityKey": false,
          "securityNote": "開錠不要（マスターキー常設キーボックスあり）",
          "notes": "インバーターファンVベルト張り点検。吹出口差圧測定実施。",
          "completed": false,
          "maintTarget": true,
          "maintPeriod": "2026年度 (4月〜3月)",
          "maintStatus": "pending",
          "maintNote": "インバーターファンVベルト張り点検。吹出口差圧測定実施。",
          "filterTarget": true,
          "filterQuarter": "第3四半期 (10〜12月)",
          "filterSpec": "ロールフィルター・粗塵用 500×500×20mm × 8枚",
          "filterToolNote": "インバーターファンVベルト張り点検。吹出口差圧測定実施。",
          "filterStatus": "pending",
          "repairActive": false,
          "repairRequestNo": "",
          "repairDate": "",
          "repairSymptom": "",
          "repairAction": "",
          "repairStatus": "done"
        },
        {
          "id": "EQ-101-05",
          "floor": "B1F",
          "entrance": {
            "name": "地下機械ピット搬入口",
            "lat": 35.6331,
            "lng": 139.8835,
            "photoUrl": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
            "photoCaption": "外周道路沿いのスロープを下りた突き当たりの重防音扉。"
          },
          "roomName": "地下主機械室・ポンプピット",
          "hvacType": "冷温水循環ポンプ＆強制排気ファン",
          "indoorUnitsCount": 3,
          "needSecurityKey": true,
          "securityNote": "要セキュリティ開錠（南京錠キーNo.55）",
          "notes": "⚠️ 酸欠注意エリア。入室前ファン強制換気3分必須。メカニカルシール目視。",
          "completed": false,
          "maintTarget": true,
          "maintPeriod": "2026年度 (4月〜3月)",
          "maintStatus": "pending",
          "maintNote": "⚠️ 酸欠注意エリア。入室前ファン強制換気3分必須。メカニカルシール目視。",
          "filterTarget": true,
          "filterQuarter": "第3四半期 (10〜12月)",
          "filterSpec": "防塵メッシュフィルター 450×450mm × 3枚",
          "filterToolNote": "⚠️ 酸欠注意エリア。入室前ファン強制換気3分必須。メカニカルシール目視。",
          "filterStatus": "pending",
          "repairActive": false,
          "repairRequestNo": "",
          "repairDate": "",
          "repairSymptom": "",
          "repairAction": "",
          "repairStatus": "done"
        }
      ]
    },
    {
      "id": "fac-tdl-by01",
      "areaId": "tdl-tomorrow",
      "name": "北側第1バックヤード管理棟",
      "category": "バックヤード事務所",
      "code": "FAC-BY01",
      "color": "#64748b",
      "fillColor": "#cbd5e1",
      "lat": 35.6346,
      "lng": 139.8825,
      "polygon": [
        [
          35.6348,
          139.882
        ],
        [
          35.6348,
          139.883
        ],
        [
          35.6343,
          139.883
        ],
        [
          35.6343,
          139.882
        ]
      ],
      "description": "運営部・清掃課・施設保守待機室が入る2階建て管理オフィス棟。",
      "equipments": [
        {
          "id": "EQ-BY-01",
          "floor": "屋上",
          "entrance": {
            "name": "管理棟 南側外階段",
            "lat": 35.6344,
            "lng": 139.8823,
            "photoUrl": "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80",
            "photoCaption": "事務所正面玄関の左手にある非常鉄骨階段から屋上へ上がります。"
          },
          "roomName": "屋上室外機置場",
          "hvacType": "パッケージエアコン室外機",
          "indoorUnitsCount": 2,
          "needSecurityKey": false,
          "securityNote": "開錠不要",
          "notes": "アルミフィン水洗い洗浄推奨。ガス圧点検ゲージ持参。",
          "completed": false,
          "maintTarget": true,
          "maintPeriod": "2026年度 (4月〜3月)",
          "maintStatus": "pending",
          "maintNote": "アルミフィン水洗い洗浄推奨。ガス圧点検ゲージ持参。",
          "filterTarget": true,
          "filterQuarter": "第3四半期 (10〜12月)",
          "filterSpec": "中性能プレフィルター 595×595×50mm × 6枚",
          "filterToolNote": "アルミフィン水洗い洗浄推奨。ガス圧点検ゲージ持参。",
          "filterStatus": "done",
          "repairActive": true,
          "repairRequestNo": "OLC-26-1046",
          "repairDate": "2026/10/24",
          "repairSymptom": "冷房能力低下・吹出温度高警報発報",
          "repairAction": "現地一次調査済・交換部品手配中",
          "repairStatus": "parts_wait"
        },
        {
          "id": "EQ-BY-02",
          "floor": "1F",
          "entrance": {
            "name": "管理棟 正面玄関",
            "lat": 35.6345,
            "lng": 139.8824,
            "photoUrl": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
            "photoCaption": "管理棟のメイン自動ドア。開錠不要で入室可能。"
          },
          "roomName": "1F 総合事務スペース",
          "hvacType": "天井カセット型4方向室内機",
          "indoorUnitsCount": 6,
          "needSecurityKey": false,
          "securityNote": "開錠不要",
          "notes": "🪜 5尺脚立使用。フィルター水洗い、受光部エラー履歴確認。",
          "completed": false,
          "maintTarget": true,
          "maintPeriod": "2026年度 (4月〜3月)",
          "maintStatus": "pending",
          "maintNote": "🪜 5尺脚立使用。フィルター水洗い、受光部エラー履歴確認。",
          "filterTarget": true,
          "filterQuarter": "第3四半期 (10〜12月)",
          "filterSpec": "高性能フィルター 610×610×150mm × 2枚",
          "filterToolNote": "🪜 5尺脚立使用。フィルター水洗い、受光部エラー履歴確認。",
          "filterStatus": "pending",
          "repairActive": false,
          "repairRequestNo": "",
          "repairDate": "",
          "repairSymptom": "",
          "repairAction": "",
          "repairStatus": "done"
        }
      ]
    },
    {
      "id": "fac-tdl-energy-main",
      "areaId": "tdl-center-energy",
      "name": "中央エネルギーセンター 本棟",
      "category": "基幹プラント",
      "code": "FAC-NRG01",
      "color": "#f59e0b",
      "fillColor": "#fde68a",
      "lat": 35.636,
      "lng": 139.8805,
      "polygon": [
        [
          35.6365,
          139.8798
        ],
        [
          35.6365,
          139.8812
        ],
        [
          35.6355,
          139.8812
        ],
        [
          35.6355,
          139.8798
        ]
      ],
      "description": "パーク全域へ冷温水をパイプライン供給する最大規模の熱源プラント棟。",
      "equipments": [
        {
          "id": "EQ-NRG-01",
          "floor": "1F",
          "entrance": {
            "name": "東側 大型機器搬入口ゲート",
            "lat": 35.636,
            "lng": 139.8813,
            "photoUrl": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
            "photoCaption": "トラックヤードに面した大型シャッター脇の通用口。"
          },
          "roomName": "1F ターボ冷凍機プラント室",
          "hvacType": "大型ターボ冷凍機（CH-1, CH-2）",
          "indoorUnitsCount": 2,
          "needSecurityKey": true,
          "securityNote": "要セキュリティ開錠（プラント責任者許可・貸出キー）",
          "notes": "⚠️ ヘルメット・安全靴必須。冷水出口温度・冷媒パージ装置動作チェック。",
          "completed": false,
          "maintTarget": true,
          "maintPeriod": "2026年度 (4月〜3月)",
          "maintStatus": "pending",
          "maintNote": "⚠️ ヘルメット・安全靴必須。冷水出口温度・冷媒パージ装置動作チェック。",
          "filterTarget": true,
          "filterQuarter": "第3四半期 (10〜12月)",
          "filterSpec": "4方向カセット標準フィルター 520×520mm × 3枚",
          "filterToolNote": "⚠️ ヘルメット・安全靴必須。冷水出口温度・冷媒パージ装置動作チェック。",
          "filterStatus": "pending",
          "repairActive": false,
          "repairRequestNo": "",
          "repairDate": "",
          "repairSymptom": "",
          "repairAction": "",
          "repairStatus": "done"
        },
        {
          "id": "EQ-NRG-02",
          "floor": "1F",
          "entrance": {
            "name": "東側 大型機器搬入口ゲート",
            "lat": 35.636,
            "lng": 139.8813,
            "photoUrl": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
            "photoCaption": "トラックヤードに面した大型シャッター脇の通用口。"
          },
          "roomName": "ボイラー室",
          "hvacType": "真空温水ヒーターボイラー",
          "indoorUnitsCount": 2,
          "needSecurityKey": true,
          "securityNote": "要セキュリティ開錠",
          "notes": "排ガス分析計持参。軟水器塩分濃度チェック。",
          "completed": false,
          "maintTarget": true,
          "maintPeriod": "2026年度 (4月〜3月)",
          "maintStatus": "pending",
          "maintNote": "排ガス分析計持参。軟水器塩分濃度チェック。",
          "filterTarget": true,
          "filterQuarter": "第3四半期 (10〜12月)",
          "filterSpec": "ロールフィルター・粗塵用 500×500×20mm × 8枚",
          "filterToolNote": "排ガス分析計持参。軟水器塩分濃度チェック。",
          "filterStatus": "done",
          "repairActive": false,
          "repairRequestNo": "",
          "repairDate": "",
          "repairSymptom": "",
          "repairAction": "",
          "repairStatus": "done"
        }
      ]
    },
    {
      "id": "fac-tds-soarin",
      "areaId": "tds-mediterranean",
      "name": "フライトライド ミュージアム棟",
      "category": "アトラクション",
      "code": "FAC-S101",
      "color": "#06b6d4",
      "fillColor": "#a5f3fc",
      "lat": 35.6278,
      "lng": 139.885,
      "polygon": [
        [
          35.6282,
          139.8845
        ],
        [
          35.6282,
          139.8856
        ],
        [
          35.6274,
          139.8856
        ],
        [
          35.6274,
          139.8845
        ]
      ],
      "description": "丘の上に建つ博物館型飛行体験アトラクション。シアター大空間空調。",
      "equipments": [
        {
          "id": "EQ-SOA-01",
          "floor": "B1F",
          "entrance": {
            "name": "バックヤード南側 搬入サービスロード扉",
            "lat": 35.6273,
            "lng": 139.8847,
            "photoUrl": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
            "photoCaption": "石畳の側道を回り込んだバックヤード専用ゲート内の防音扉。"
          },
          "roomName": "メインシアター空調機械室 A",
          "hvacType": "大型低騒音エアハンドリングユニット",
          "indoorUnitsCount": 2,
          "needSecurityKey": true,
          "securityNote": "要セキュリティ開錠（アトラクション運営室許可要）",
          "notes": "🪜 8尺脚立必要（天井高4.2m）。サイレンサー消音ダクト目視点検。",
          "completed": false,
          "maintTarget": true,
          "maintPeriod": "2026年度 (4月〜3月)",
          "maintStatus": "pending",
          "maintNote": "🪜 8尺脚立必要（天井高4.2m）。サイレンサー消音ダクト目視点検。",
          "filterTarget": true,
          "filterQuarter": "第3四半期 (10〜12月)",
          "filterSpec": "防塵メッシュフィルター 450×450mm × 3枚",
          "filterToolNote": "🪜 8尺脚立必要（天井高4.2m）。サイレンサー消音ダクト目視点検。",
          "filterStatus": "pending",
          "repairActive": true,
          "repairRequestNo": "OLC-26-1050",
          "repairDate": "2026/10/24",
          "repairSymptom": "冷房能力低下・吹出温度高警報発報",
          "repairAction": "Vベルトおよびベアリング交換要",
          "repairStatus": "pending"
        },
        {
          "id": "EQ-SOA-02",
          "floor": "1F",
          "entrance": {
            "name": "エントランスロビー脇 保守点検扉",
            "lat": 35.6277,
            "lng": 139.8848,
            "photoUrl": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
            "photoCaption": "壁画の左側にある意匠カモフラージュ扉。プッシュ式隠しラッチ。"
          },
          "roomName": "特別展示室・キューライン",
          "hvacType": "天井隠蔽ダクト接続形パッケージ",
          "indoorUnitsCount": 4,
          "needSecurityKey": false,
          "securityNote": "開錠不要（パーク閉園後入室）",
          "notes": "吹出口アネモディフューザー清掃。風量微調整。",
          "completed": true,
          "maintTarget": true,
          "maintPeriod": "2026年度 (4月〜3月)",
          "maintStatus": "done",
          "maintNote": "吹出口アネモディフューザー清掃。風量微調整。",
          "filterTarget": true,
          "filterQuarter": "第3四半期 (10〜12月)",
          "filterSpec": "中性能プレフィルター 595×595×50mm × 6枚",
          "filterToolNote": "吹出口アネモディフューザー清掃。風量微調整。",
          "filterStatus": "pending",
          "repairActive": false,
          "repairRequestNo": "",
          "repairDate": "",
          "repairSymptom": "",
          "repairAction": "",
          "repairStatus": "done"
        }
      ]
    },
    {
      "id": "fac-tds-journey",
      "areaId": "tds-mysterious",
      "name": "地底走行センター 火山カルデラ棟",
      "category": "アトラクション",
      "code": "FAC-J101",
      "color": "#ef4444",
      "fillColor": "#fca5a5",
      "lat": 35.6256,
      "lng": 139.884,
      "polygon": [
        [
          35.626,
          139.8835
        ],
        [
          35.626,
          139.8846
        ],
        [
          35.6252,
          139.8846
        ],
        [
          35.6252,
          139.8835
        ]
      ],
      "description": "プロメテウス火山内部を走行する地底探検施設。高温多湿・洞窟空調設備。",
      "equipments": [
        {
          "id": "EQ-JOU-01",
          "floor": "洞窟内 3F",
          "entrance": {
            "name": "テラベーター保守専用昇降口",
            "lat": 35.6258,
            "lng": 139.8838,
            "photoUrl": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
            "photoCaption": "掘削坑道奥の金属網ドア。専用キーNo.71が必要。"
          },
          "roomName": "地底掘削機動力室",
          "hvacType": "防爆耐熱スポットエアコン＆排熱ファン",
          "indoorUnitsCount": 3,
          "needSecurityKey": true,
          "securityNote": "要セキュリティ開錠（危険物エリア指定・キーNo.71）",
          "notes": "⚠️ 防塵メガネ・手袋必須。モータ軸受グリスアップ。Vベルト交換。",
          "completed": false,
          "maintTarget": true,
          "maintPeriod": "2026年度 (4月〜3月)",
          "maintStatus": "pending",
          "maintNote": "⚠️ 防塵メガネ・手袋必須。モータ軸受グリスアップ。Vベルト交換。",
          "filterTarget": true,
          "filterQuarter": "第3四半期 (10〜12月)",
          "filterSpec": "高性能フィルター 610×610×150mm × 2枚",
          "filterToolNote": "⚠️ 防塵メガネ・手袋必須。モータ軸受グリスアップ。Vベルト交換。",
          "filterStatus": "done",
          "repairActive": true,
          "repairRequestNo": "OLC-26-1052",
          "repairDate": "2026/10/24",
          "repairSymptom": "インバーター過電流トリップ・再起動不可",
          "repairAction": "Vベルトおよびベアリング交換要",
          "repairStatus": "pending"
        },
        {
          "id": "EQ-JOU-02",
          "floor": "1F",
          "entrance": {
            "name": "溶岩湖展望デッキ通用扉",
            "lat": 35.6254,
            "lng": 139.8842,
            "photoUrl": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
            "photoCaption": "展望台下のキャスト専用通路。"
          },
          "roomName": "キャストステーション",
          "hvacType": "天井カセット型4方向室内機",
          "indoorUnitsCount": 2,
          "needSecurityKey": false,
          "securityNote": "開錠不要",
          "notes": "🪜 4尺脚立。ドレンポンプ揚程確認。",
          "completed": false,
          "maintTarget": true,
          "maintPeriod": "2026年度 (4月〜3月)",
          "maintStatus": "pending",
          "maintNote": "🪜 4尺脚立。ドレンポンプ揚程確認。",
          "filterTarget": true,
          "filterQuarter": "第3四半期 (10〜12月)",
          "filterSpec": "4方向カセット標準フィルター 520×520mm × 3枚",
          "filterToolNote": "🪜 4尺脚立。ドレンポンプ揚程確認。",
          "filterStatus": "pending",
          "repairActive": false,
          "repairRequestNo": "",
          "repairDate": "",
          "repairSymptom": "",
          "repairAction": "",
          "repairStatus": "done"
        }
      ]
    }
  ],
  "lastUpdated": 1792910727372
};
