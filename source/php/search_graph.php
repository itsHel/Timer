<?php
    include "../ini.php";

    $from = $_GET["from"];
    $till = $_GET["till"];
    if($from == "this week" || $from == "last week" || $from == "this month" || $from == "last month" || $from == "yesterday"){
        switch ($from){
            case "yesterday":
                $cmd = "SELECT activity, SUM(duration) as duration, DATE(MAX(start)) as start, MAX(start) as startTime, MAX(end) as end from data WHERE DATE(start) = DATE(NOW() - INTERVAL 1 DAY) AND user = :user GROUP BY DATE(start), activity ORDER BY DATE(start) DESC, activity ASC";
                break;
            case "this week":
                $cmd = "SELECT activity, SUM(duration) as duration, WEEKDAY(DATE(MAX(start))) as start, MAX(start) as startTime, MAX(end) as end from data WHERE YEARWEEK(start, 1) = YEARWEEK(NOW(), 1) AND user = :user GROUP BY DATE(start), activity ORDER BY DATE(start) DESC, activity ASC";
                break;
            case "last week":
                $cmd = "SELECT activity, SUM(duration) as duration, WEEKDAY(DATE(MAX(start))) as start, MAX(start) as startTime, MAX(end) as end from data WHERE YEARWEEK(start, 1) = YEARWEEK(NOW() - INTERVAL 1 WEEK, 1) AND user = :user GROUP BY DATE(start), activity ORDER BY DATE(start) DESC, activity ASC";
                break;
            case "this month":
                $cmd = "SELECT activity, SUM(duration) as duration, DATE(MAX(start)) as start, MAX(start) as startTime, MAX(end) as end from data WHERE MONTH(start) = MONTH(CURRENT_DATE()) AND YEAR(start) = YEAR(CURRENT_DATE()) AND user = :user GROUP BY DATE(start), activity ORDER BY DATE(start) DESC, activity ASC";
                break;
            case "last month":
                $cmd = "SELECT activity, SUM(duration) as duration, DATE(MAX(start)) as start, MAX(start) as startTime, MAX(end) as end from data WHERE MONTH(start) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) AND YEAR(start) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH) AND user = :user GROUP BY DATE(start), activity ORDER BY DATE(start) DESC, activity ASC";
                break;
            case "all":
                $cmd = "SELECT activity, SUM(duration) as duration, DATE(MAX(start)) as start, MAX(start) as startTime, MAX(end) as end from data WHERE user = :user GROUP BY DATE(start), activity ORDER BY DATE(start) DESC, activity ASC";
                break;
        }
        try{
            $stmt = $db->prepare($cmd);
            $stmt->execute(array(":user" => $_SESSION["email"]));
        } catch(PDOException $ex){
            error_save($ex->getMessage());
            die("error");
        }
    } else if($from == "default"){
        //default - last day
        $cmd = "SELECT start FROM data WHERE ID = (SELECT MAX(ID) FROM data WHERE user = :user)";
        try{
            $stmt = $db->prepare($cmd);
            $stmt->execute(array(":user" => $_SESSION["email"]));
        } catch(PDOException $ex){
            error_save($ex->getMessage());
            die("error");
        }
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $last_date = $row["start"];

        $cmd = "SELECT activity, duration, start, end from data WHERE user = :user AND DATE(start) = DATE('". $last_date ."') ORDER BY duration DESC";
        try{
            $stmt = $db->prepare($cmd);
            $stmt->execute(array(":user" => $_SESSION["email"]));
        } catch(PDOException $ex){
            error_save($ex->getMessage());
            die("error");
        }
    } else {
        //date range        
        $cmd = "SELECT activity, SUM(duration) as duration, DATE(MAX(start)) as start, MAX(start) as startTime, MAX(end) as end from data WHERE DATE(start) <= :startDate AND DATE(start) >= :date_border AND user = :user GROUP BY DATE(start), activity ORDER BY DATE(start) DESC, activity ASC";
        try{
            $stmt = $db->prepare($cmd);
            $stmt->execute(array(":startDate" => $till, ":date_border" => $from, ":user" => $_SESSION["email"]));
        } catch(PDOException $ex){
            error_save($ex->getMessage());
            die("error");
        }
    }
    
    $array = [];
    if($stmt->rowCount() > 0)
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)){
            $temp = (object) ["activity" => $row["activity"], "duration" => (int)$row["duration"], "start" => $row["start"], "startTime" => isset($row["startTime"]) ? $row["startTime"] : $row["start"], "endTime" => $row["end"]];
            array_push($array,$temp);
        }
    echo json_encode($array);    
    $db = null;
?>