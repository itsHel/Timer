<?php
    include "../ini.php";

    if(isset($_GET["logout"])){
        //$_SESSION =
        session_destroy();
        setcookie("session", null, -1);
        $db = null;
        die("ok");
    }

    if(isset($_GET["pass"])){
        $pass_hashed = hash("gost", $_GET["pass"]);
        $cmd = "SELECT email,pass FROM users WHERE email = :email AND pass = :pass";
        try{
            $stmt = $db->prepare($cmd);
            $stmt->execute(array(":email" => $_GET["email"], ":pass" => $pass_hashed));
        } catch(PDOException $ex) {
            error_save($ex->getMessage());
            die("error");
        }
    } else if(!empty($_GET["session"])){
        $cmd = "SELECT email FROM users WHERE session = :session";
        try{
            $stmt = $db->prepare($cmd);
            $stmt->execute(array(":session" => $_GET["session"]));
        } catch(PDOException $ex) {
            error_save($ex->getMessage());
            die("error");
        }
    } else die("3");

    if($stmt->rowCount() == 1){
        echo "ok";
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if(isset($row["email"]))                    
            $_GET["email"] = $row["email"];
        $_SESSION["email"] = $_GET["email"];
        //exit if user dont want keep in
        if($_GET["keep_in"] == "false"){
            $db = null;
            exit();
        }
        //else
        //generate key, cookie, key to db, 
        $key = uniqid("", true);             // bin2hex(random_bytes(30));
        $session = hash("sha256", $_GET["email"]);
        setcookie("session", $session . ";" . $key);
        $cmd = "UPDATE users SET session = :session WHERE email = :email";
        try{
            $stmt = $db->prepare($cmd);
            $stmt->execute(array(":session" => $session, ":email" => $_GET["email"]));
        } catch(PDOException $ex) {
            error_save($ex->getMessage());
            die("error");
        }
        if(!empty($_GET["session"]))
            echo "cookie login";
    }
    else
        echo "not_found";
    $db = null;
?>