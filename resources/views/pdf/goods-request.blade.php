<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>{{ $goodsRequest->fpb_number }}</title>
    <style>
        * { font-family: DejaVu Sans, sans-serif; }
        body { font-size: 11px; color: #111827; margin: 0; }
        .company { text-align: center; font-size: 16px; font-weight: bold; letter-spacing: 1px; }
        .title { text-align: center; font-size: 14px; font-weight: bold; letter-spacing: 2px; margin-top: 2px; text-decoration: underline; }
        .rule { border-top: 2px solid #111827; margin: 8px 0 10px; }
        .info { width: 100%; margin-bottom: 8px; }
        .info td { vertical-align: top; padding: 1px 0; }
        .info .label { width: 110px; color: #374151; }
        .info .colon { width: 10px; }
        table.items { width: 100%; border-collapse: collapse; }
        table.items th, table.items td { border: 1px solid #111827; padding: 3px 5px; }
        table.items thead th { background: #e5e7eb; text-align: center; font-size: 10px; }
        table.items td.no { text-align: center; width: 24px; }
        table.items td.unit { text-align: center; width: 55px; }
        table.items td.qty { text-align: right; width: 48px; }
        table.items td.name { line-height: 1.35; }
        .code { color: #4b5563; font-size: 9px; }
        tr.total td { font-weight: bold; background: #f3f4f6; }
        .terbilang { margin-top: 6px; font-size: 11px; }
        .terbilang .value { font-style: italic; }
        .sign { width: 100%; margin-top: 22px; }
        .sign td { width: 33.33%; text-align: center; vertical-align: top; padding: 0 6px; }
        .sign .role { font-weight: bold; }
        .sign .subrole { color: #4b5563; font-size: 10px; }
        .sign .space { height: 58px; }
        .sign .line { border-top: 1px solid #111827; padding-top: 3px; }
        .meta { text-align: right; color: #6b7280; font-size: 9px; margin-top: 4px; }
    </style>
</head>
<body>
    <div class="company">{{ $company['name'] }}</div>
    <div class="title">FORM PERMINTAAN BARANG</div>
    <div class="rule"></div>

    <table class="info">
        <tr>
            <td width="50%">
                <table class="info">
                    <tr>
                        <td class="label">BRANCH / SUBBRANCH</td>
                        <td class="colon">:</td>
                        <td>{{ trim(($goodsRequest->branch ?? '') . ' / ' . ($goodsRequest->subbranch ?? ''), ' /') ?: '-' }}</td>
                    </tr>
                    <tr>
                        <td class="label">NAMA SALESMAN</td>
                        <td class="colon">:</td>
                        <td>{{ $goodsRequest->salesman_name ?? $goodsRequest->user?->name ?? '-' }}</td>
                    </tr>
                </table>
            </td>
            <td width="50%">
                <table class="info">
                    <tr>
                        <td class="label">TANGGAL</td>
                        <td class="colon">:</td>
                        <td>{{ optional($goodsRequest->request_date)->format('d/m/Y') }}</td>
                    </tr>
                    <tr>
                        <td class="label">NO. FPB</td>
                        <td class="colon">:</td>
                        <td>{{ $goodsRequest->fpb_number }}</td>
                    </tr>
                    <tr>
                        <td class="label">RYN</td>
                        <td class="colon">:</td>
                        <td>{{ $goodsRequest->ryn ?: '-' }}</td>
                    </tr>
                    <tr>
                        <td class="label">NO. POL</td>
                        <td class="colon">:</td>
                        <td>{{ $goodsRequest->vehicle_number ?: '-' }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="items">
        <thead>
            <tr>
                <th rowspan="2" width="24">NO.</th>
                <th rowspan="2">NAMA BARANG</th>
                <th rowspan="2" width="55">SATUAN</th>
                <th colspan="3">DIMINTA</th>
            </tr>
            <tr>
                <th width="48">KTN</th>
                <th width="48">RCG</th>
                <th width="48">BKS</th>
            </tr>
        </thead>
        <tbody>
            @for ($i = 0; $i < 15; $i++)
                @php $item = $goodsRequest->items->get($i); @endphp
                <tr>
                    <td class="no">{{ $i + 1 }}</td>
                    <td class="name">
                        @if($item)
                            {{ $item->product_name }}<br><span class="code">{{ $item->product_code }}</span>
                        @endif
                    </td>
                    <td class="unit">{{ $item->unit ?? '' }}</td>
                    <td class="qty">{{ $item ? rtrim(rtrim(number_format((float) $item->qty_ktn, 2, '.', ''), '0'), '.') : '' }}</td>
                    <td class="qty">{{ $item ? rtrim(rtrim(number_format((float) $item->qty_rcg, 2, '.', ''), '0'), '.') : '' }}</td>
                    <td class="qty">{{ $item ? rtrim(rtrim(number_format((float) $item->qty_bks, 2, '.', ''), '0'), '.') : '' }}</td>
                </tr>
            @endfor
            <tr class="total">
                <td colspan="3" style="text-align:right">TOTAL</td>
                <td class="qty">{{ rtrim(rtrim(number_format($totals['ktn'], 2, '.', ''), '0'), '.') ?: '0' }}</td>
                <td class="qty">{{ rtrim(rtrim(number_format($totals['rcg'], 2, '.', ''), '0'), '.') ?: '0' }}</td>
                <td class="qty">{{ rtrim(rtrim(number_format($totals['bks'], 2, '.', ''), '0'), '.') ?: '0' }}</td>
            </tr>
        </tbody>
    </table>

    <div class="terbilang">
        TERBILANG : <span class="value">{{ ucfirst($terbilang) }}</span>
    </div>

    <table class="sign">
        <tr>
            <td>
                <div class="role">DISETUJUI OLEH</div>
                <div class="subrole">BSM / ASM / LOG SPV / AOS</div>
                <div class="space"></div>
                <div class="line">NAMA : {{ $goodsRequest->approved_by_name ?: '................' }}</div>
                <div>TGL&nbsp;&nbsp;&nbsp;: {{ optional($goodsRequest->approved_at)->format('d/m/Y') ?: '................' }}</div>
            </td>
            <td>
                <div class="role">DIPERIKSA OLEH</div>
                <div class="subrole">ASS / SK</div>
                <div class="space"></div>
                <div class="line">NAMA : {{ $goodsRequest->checked_by_name ?: '................' }}</div>
                <div>TGL&nbsp;&nbsp;&nbsp;: {{ optional($goodsRequest->checked_at)->format('d/m/Y') ?: '................' }}</div>
            </td>
            <td>
                <div class="role">DIMINTA OLEH</div>
                <div class="subrole">DUTA NIAGA</div>
                <div class="space"></div>
                <div class="line">NAMA : {{ $goodsRequest->requested_by_name ?: ($goodsRequest->salesman_name ?? '................') }}</div>
                <div>TGL&nbsp;&nbsp;&nbsp;: {{ optional($goodsRequest->requested_at)->format('d/m/Y') ?: '................' }}</div>
            </td>
        </tr>
    </table>

    <div class="meta">Dicetak: {{ now()->format('d/m/Y H:i') }}</div>
</body>
</html>
