<?php
    include "../ini.php";

    $cmd = "SELECT email FROM users WHERE email = :email";
    try{
        $stmt = $db->prepare($cmd);
        $stmt->execute(array(":email" => $_GET["email"]));
    } catch(PDOException $ex) {
        error_save($ex->getMessage());
        die("error");
    }
    $db = null;
    if($stmt->rowCount() > 0)
        echo "taken";
    else
        echo "ok";
?>