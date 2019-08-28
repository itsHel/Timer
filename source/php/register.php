<?php
    include "../ini.php";
    $pass_hashed = hash("gost", $_POST["pass"]);
    //$cmd = "INSERT INTO users values (null, '".$_POST["email"]."', '".$pass_hashed."', NOW(), 1, false, null)";
    $cmd = "INSERT INTO users values (null, :email, :pass, NOW(), 1, false, null)";
    try{
        $stmt = $db->prepare($cmd);
        $stmt->execute(array(":email" => $_POST["email"], ":pass" => $pass_hashed));
    } catch(PDOException $ex) {
        error_save($ex->getMessage());
        die("error");
    }
    $db = null;
    echo "ok";
?>