CREATE 
    ALGORITHM = UNDEFINED 
    DEFINER = `gmedia_democase2`@`%.%.%.%` 
VIEW `gmedia_democase`.`karyawan_rafli` AS
    SELECT 
        ROW_NUMBER() over (ORDER BY `gmedia_democase`.`karyawan`.`nip`) AS `No`,
        `gmedia_democase`.`karyawan`.`nip` AS `Nip`,
        `gmedia_democase`.`karyawan`.`nama` AS `Nama`,
        `gmedia_democase`.`karyawan`.`alamat` AS `Alamat`,
        CASE
            WHEN `gmedia_democase`.`karyawan`.`gend` = 'L' THEN 'Laki-laki'
            WHEN `gmedia_democase`.`karyawan`.`gend` = 'P' THEN 'Perempuan'
        END AS `Gend`,
        DATE_FORMAT(`gmedia_democase`.`karyawan`.`tgl_lahir`,
                '%d %M %Y') AS `Tanggal Lahir`
    FROM
        `gmedia_democase`.`karyawan`