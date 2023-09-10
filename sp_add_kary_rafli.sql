DELIMITER //
CREATE DEFINER=`gmedia_democase2`@`%.%.%.%` PROCEDURE `sp_add_kary_rafli`(
    IN user_id varchar(100),
    IN nip varchar(50), 
    IN nama varchar(200), 
    IN alamat varchar(200), 
    IN gend enum('L','P'), 
    IN tgl_lahir date,
    IN insert_at date,
    IN api varchar(100)
    )
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
  	ROLLBACK;
	  GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, 
 	  @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
	  SELECT @sqlstate, @errno, @text;
	  INSERT INTO log_trx_api (
      user_id, 
      api, 
      request, 
      response, 
      insert_at
      ) VALUES (
        user_id, 
        IF(api IS NULL, "sp_add_kary_rafli", api), 
        CONCAT('{"nip":"',nip,'","nama":"',nama,'","alamat":"',alamat,'","gend":"',gend,'","tgl_lahir":"',IF(tgl_lahir IS NULL, DATE(FROM_UNIXTIME(0)), tgl_lahir),'","insert_at":"',IF(insert_at IS NULL, now(), insert_at),'"}'),
        @text, 
        insert_at
      );
  END;

  START TRANSACTION;
    INSERT INTO karyawan (
      nip, nama, alamat, 
      gend, tgl_lahir, insert_at
    ) VALUES (
      nip, nama, alamat, 
      gend, IF(tgl_lahir IS NULL, DATE(FROM_UNIXTIME(0)), tgl_lahir), IF(insert_at IS NULL, now(), insert_at)
    );
	  INSERT INTO log_trx_api (
      user_id, 
      api, 
      request, 
      response, 
      insert_at
    ) VALUES (
      user_id,
       IF(api IS NULL, "sp_add_kary_rafli", api), 
      CONCAT('{"nip":"',nip,'","nama":"',nama,'","alamat":"',alamat,'","gend":"',gend,'","tgl_lahir":"',IF(tgl_lahir IS NULL, DATE(FROM_UNIXTIME(0)), tgl_lahir),'","insert_at":"',IF(insert_at IS NULL, now(), insert_at),'"}'),
      "Operasi tambah data berhasil.",
      insert_at
    );
  COMMIT;
END
//