<?php
    include "../ini.php";

    if(isset($_POST["expression"])){                         // autocomplete
        $cmd = "SELECT activity FROM data WHERE activity like :exp AND user = :email GROUP BY activity;";
        
        try{
            $stmt = $db->prepare($cmd);
            $stmt->execute(array(":exp" => "%". $_POST["expression"] ."%", ":email" => $_SESSION["email"]));
        } catch(PDOException $ex) {
            error_save($ex->getMessage());
            die("error");
        }
        if($stmt->rowCount() > 0)
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)){
                echo $row["activity"].";";
            }
    } else                                                 // date set
    switch($_GET["from"]){
        case "yesterday":
            $cmd = "SELECT id, COUNT(id) as count, activity, SUM(duration) as duration, MAX(start) as start, MAX(end) as end from data WHERE DATE(start) = DATE(NOW() - INTERVAL 1 DAY) AND user = :email GROUP BY DATE(start), activity ORDER BY DATE(start) DESC, activity ASC";
            getdata($cmd, [":email" => $_SESSION["email"]]);
            echo ";;;";
            $cmd = "SELECT id, activity, duration, start, end FROM data WHERE DATE(start) = DATE(NOW() - INTERVAL 1 DAY) AND user = :email ORDER BY DATE(start) DESC, activity ASC";
            getdata($cmd, [":email" => $_SESSION["email"]]);
            break;
        case "this week":
            $cmd = "SELECT id, COUNT(id) as count, activity, SUM(duration) as duration, MAX(start) as start, MAX(end) as end from data WHERE YEARWEEK(start) = YEARWEEK(NOW()) AND user = :email GROUP BY DATE(start), activity ORDER BY DATE(start) DESC, activity ASC";
            getdata($cmd, [":email" => $_SESSION["email"]]);
            echo ";;;";
            $cmd = "SELECT id, activity, duration, start, end FROM data WHERE YEARWEEK(start) = YEARWEEK(NOW()) AND user = :email ORDER BY DATE(start) DESC, activity ASC";
            getdata($cmd, [":email" => $_SESSION["email"]]);
            break;
        case "last week":
            $cmd = "SELECT id, COUNT(id) as count, activity, SUM(duration) as duration, MAX(start) as start, MAX(end) as end from data WHERE YEARWEEK(start) = YEARWEEK(NOW() - INTERVAL 1 WEEK) AND user = :email GROUP BY DATE(start), activity ORDER BY DATE(start) DESC, activity ASC";
            getdata($cmd, [":email" => $_SESSION["email"]]);
            echo ";;;";
            $cmd = "SELECT id, activity, duration, start, end FROM data WHERE YEARWEEK(start) = YEARWEEK(NOW() - INTERVAL 1 WEEK) AND user = :email ORDER BY DATE(start) DESC, activity ASC";
            getdata($cmd, [":email" => $_SESSION["email"]]);
            break;
        case "this month":
            $cmd = "SELECT id, COUNT(id) as count, activity, SUM(duration) as duration, MAX(start) as start, MAX(end) as end from data WHERE MONTH(start) = MONTH(CURRENT_DATE()) AND YEAR(start) = YEAR(CURRENT_DATE()) AND user = :email GROUP BY DATE(start), activity ORDER BY DATE(start) DESC, activity ASC";
            getdata($cmd, [":email" => $_SESSION["email"]]);
            echo ";;;";
            $cmd = "SELECT id, activity, duration, start, end FROM data WHERE MONTH(start) = MONTH(CURRENT_DATE()) AND YEAR(start) = YEAR(CURRENT_DATE()) AND user = :email ORDER BY DATE(start) DESC, activity ASC";
            getdata($cmd, [":email" => $_SESSION["email"]]);
            break;
        case "last month":
            $cmd = "SELECT id, COUNT(id) as count, activity, SUM(duration) as duration, MAX(start) as start, MAX(end) as end from data WHERE MONTH(start) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) AND YEAR(start) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH) AND user = :email GROUP BY DATE(start), activity ORDER BY DATE(start) DESC, activity ASC";
            getdata($cmd, [":email" => $_SESSION["email"]]);
            echo ";;;";
            $cmd = "SELECT id, activity, duration, start, end FROM data WHERE MONTH(start) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) AND YEAR(start) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH) AND user = :email ORDER BY DATE(start) DESC, activity ASC";
            getdata($cmd, [":email" => $_SESSION["email"]]);
            break;
        case "all":
            $cmd = "SELECT id, COUNT(id) as count, activity, SUM(duration) as duration, MAX(start) as start, MAX(end) as end from data WHERE user = :email GROUP BY DATE(start), activity ORDER BY DATE(start) DESC, activity ASC";
            getdata($cmd, [":email" => $_SESSION["email"]]);
            echo ";;;";
            $cmd = "SELECT id, activity, duration, start, end FROM data WHERE user = :email ORDER BY DATE(start) DESC, activity ASC";
            getdata($cmd, [":email" => $_SESSION["email"]]);
            break;
        default:
            $from = $_GET["from"];
            $till = $_GET["till"];
            if($from == "default")                              //
                $startDate = "CURDATE()";
            else
                $startDate = $from;

            // GET last date
            if($till == ""){
                $_GET["limit"] = "3";

                $cmd = "SELECT DATE(start) as start FROM `data` WHERE DATE(start) <= :startDate GROUP BY DATE(start) ORDER BY DATE(start) DESC LIMIT ". $_GET["limit"];
                try{
                    $stmt = $db->prepare($cmd);
                    $stmt->execute(array(":startDate" => $startDate));
                } catch(PDOException $ex) {
                    error_save($ex->getMessage());
                    die("error");
                }
                $c = 0;
                while($row = $stmt->fetch(PDO::FETCH_ASSOC)){
                    $c++;
                    if($c == $stmt->rowCount())
                        $date_border = $row["start"];
                }
                if($c == 0){
                    die("{};;;{}");
                }
            } else {
                $date_border = $from;
                $startDate = $till;
            }
            
            // MAIN rows
            $data_to_select = "id, COUNT(id) as count, activity, SUM(duration) as duration, start, end";
            $cmd = "SELECT id, COUNT(id) as count, activity, SUM(duration) as duration, MAX(start) as start, MAX(end) as end from data WHERE DATE(start) <= :startDate AND DATE(start) >= :date_border AND user = :email GROUP BY DATE(start), activity ORDER BY DATE(start) DESC, activity ASC";
            getdata($cmd, [":startDate" => $startDate, ":date_border" => $date_border, ":email" => $_SESSION["email"]]);
            echo ";;;";
            $cmd = "SELECT id, activity, duration, start, end from data WHERE DATE(start) <= :startDate AND DATE(start) >= :date_border AND user = :email ORDER BY DATE(start) DESC, activity ASC";
            getdata($cmd, [":startDate" => $startDate, ":date_border" => $date_border, ":email" => $_SESSION["email"]]);
    }
    $db = null;

function getdata($cmd, $variables){
    global $db;
    $array = [];
    try{
        $stmt = $db->prepare($cmd);
        $stmt->execute($variables);
    } catch(PDOException $ex) {
            error_save($ex->getMessage());
            die("error");
    }
    if($stmt->rowCount() > 0)
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)){
            $temp = (object) ["id" => $row["id"], "count" => isset($row["count"]) ? $row["count"] : "", "activity" => $row["activity"], "duration" => (int)$row["duration"], "start" => $row["start"], "myend" => $row["end"]];
            array_push($array,$temp);
        }
    echo json_encode($array);
}
?>