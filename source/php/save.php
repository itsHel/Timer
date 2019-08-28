<?php
/*    session_start();
    try{
        $db = new PDO('mysql:host=127.0.0.1; dbname=time; charset=utf8mb4',"root","", array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
    } catch(PDOException $ex) {
        echo $ex->getMessage();
    } */
   //     if($db->connect_error)
    //    die($db->connect_error);
    include "../ini.php";

    //MANUAL
    if(isset($_POST["manual"])){
        $temp = explode(" ", $_POST["start"]);
        $startTime = $temp[1];
        $end = $temp[0] ." ". $_POST["end"];
        $end = "'". $end ."'";
        $startSecs = strtotime($startTime) - strtotime("today");
        $endSecs = strtotime($_POST["end"]) - strtotime("today");
    
        if($startSecs < $endSecs){
            $duration = $endSecs - $startSecs;
        } else {
            $duration = $endSecs + (24*3600 - $startSecs);
            $end = "DATE_ADD('". $end. "', INTERVAL 1 DAY)";
        }
        
        $cmd = "INSERT INTO data VALUES(null, :activity, :duration, ".$end.", :start, :email)";
        try{
            $stmt = $db->prepare($cmd);
            $stmt->execute(array(":activity" => $_POST["activity"] ,":duration" => $duration, ":start" => $_POST["start"], ":email" => $_SESSION["email"]));
        } catch(PDOException $ex) {
            error_save($ex->getMessage());
            die("error");
        }
    } else {
    //DEFAULT
        $cmd = "INSERT INTO data VALUES(null, :activity, :duration, FROM_UNIXTIME(:end), FROM_UNIXTIME(:start), :email)";
        try{
            $stmt = $db->prepare($cmd);
            $stmt->execute(array(":activity" => $_POST["activity"] ,":duration" => $_POST["duration"], ":end" => $_POST["end"], ":start" => $_POST["start"], ":email" => $_SESSION["email"]));
        } catch(PDOException $ex) {
            error_save($ex->getMessage());
            die("error");
        }
        //$cmd = "INSERT INTO data VALUES(null, '". $_POST["activity"] ."', ". $_POST["duration"] .", FROM_UNIXTIME(". $_POST["end"] ."), FROM_UNIXTIME(". $_POST["start"] ."), '". $_SESSION["email"] ."')";
    }
    //$db->query($cmd) or die($db->error);
    $db = null;
    echo "ok";
?>