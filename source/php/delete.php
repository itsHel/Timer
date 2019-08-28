<?php
	include "../ini.php";
        
    $ids = explode(",", $_POST["id"]);
    $string = "";
    for($i = 0; $i < count($ids); $i++){
        $string.= ":id". $i .",";
    }
    $string = rtrim($string, ",");
    
    for($i = 0; $i < count($ids); $i++){
        $data[":id". $i] = $ids[$i];
    }
    $data[":user"] = $_SESSION["email"];

    $cmd = "DELETE FROM data WHERE id IN (". $string .") AND user = :user";
    try{
        $stmt = $db->prepare($cmd);
        $stmt->execute($data);
    } catch(PDOException $ex) {
        error_save($ex->getMessage());
        die("error");
    }
    $db = null;
    echo "ok";
?>