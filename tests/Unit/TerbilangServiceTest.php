<?php

namespace Tests\Unit;

use App\Services\TerbilangService;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class TerbilangServiceTest extends TestCase
{
    private TerbilangService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new TerbilangService();
    }

    #[DataProvider('cases')]
    public function test_it_spells_numbers_in_indonesian(int $number, string $expected): void
    {
        $this->assertSame($expected, $this->service->terbilang($number));
    }

    /**
     * @return array<int, array{0: int, 1: string}>
     */
    public static function cases(): array
    {
        return [
            [0, 'nol'],
            [11, 'sebelas'],
            [15, 'lima belas'],
            [21, 'dua puluh satu'],
            [100, 'seratus'],
            [101, 'seratus satu'],
            [1000, 'seribu'],
            [1500, 'seribu lima ratus'],
            [2000, 'dua ribu'],
            [1000000, 'satu juta'],
            [1234567, 'satu juta dua ratus tiga puluh empat ribu lima ratus enam puluh tujuh'],
        ];
    }
}
