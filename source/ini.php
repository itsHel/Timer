<?php
    session_start();
    try{
        $db = new PDO('mysql:host=127.0.0.1; dbname=time; charset=utf8mb4',"root","", array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
    } catch(PDOException $ex) {
        die("no connection");
    }

    function error_save($my_error){
        file_put_contents("error/error_log.txt", $my_error ."\r\n\r\n", FILE_APPEND);
    }
  
    function create_tables(){
        global $db;
        try{
            $cmd = '	
                CREATE TABLE data(
                 id int(6) unsigned NOT NULL AUTO_INCREMENT,
                 activity varchar(60) DEFAULT NULL,
                 duration int(7) DEFAULT NULL,
                 end datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
                 start datetime DEFAULT NULL,
                 user varchar(40) NOT NULL,
                 PRIMARY KEY (id)
                ) ENGINE=MyISAM AUTO_INCREMENT=248 DEFAULT CHARSET=latin1';
            $db->exec($cmd);
        } catch(PDOException $ex) {
            echo $ex->getMessage();
        }
        try{
            $cmd = '	
                CREATE TABLE users(
                     id int(6) unsigned NOT NULL AUTO_INCREMENT,
                     email varchar(40) NOT NULL,
                     pass varchar(255) DEFAULT NULL,
                     date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                     temp_key varchar(10) NOT NULL,
                     isAdmin tinyint(1) NOT NULL,
                     session varchar(128) DEFAULT NULL,
                     PRIMARY KEY (id)
                    ) ENGINE=MyISAM AUTO_INCREMENT=24 DEFAULT CHARSET=latin1;';
            $db->exec($cmd);
        } catch(PDOException $ex) {
            echo $ex->getMessage();
        }
        try{
            $cmd = "INSERT into users values (null, test, ce85b99cc46752fffee35cab9a7b0278abb4c2d2055cff685af4912c49490f8d, NOW(), 1, false, null)";
            $db->exec($cmd);
        } catch(PDOException $ex) {
            echo $ex->getMessage();
        }
    }
?>