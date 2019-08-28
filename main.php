<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel=icon href="source/imgs/ico.jpg">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel=stylesheet href="source/libs/autocomplete/styles.css">
    <link rel=stylesheet href="source/style.css">
    <script src="source/libs/tail_datepicker/tail.datetime.js"></script>
    <link rel="stylesheet" type="text/css" href="source/libs/tail_datepicker/tail.datetime-default-orange.css">  
    
    <script src="source/libs/moment.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="source/libs/lightpick/lightpick.js"></script>  
    <link rel="stylesheet" type="text/css" href="source/libs/lightpick/lightpick.css">  
    <script src="source/libs/autocomplete/jquery.autocomplete.js"></script>
    <script src="source/index.js"></script>
    
    <script src="source/libs/d3.min.js" charset="utf-8"></script>
    <link rel="stylesheet" href="source/libs/jquery-ui.css">
    <script src="source/libs/jquery-ui.js"></script>
    <link rel="stylesheet" type="text/css" href="source/libs/taucharts.min.css">    
    <script src="source/libs/taucharts.min.js" type="text/javascript"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@2.8.0/dist/Chart.min.js"></script>
    <script src="source/libs/chartsjs/chartjs-plugin-colorschemes.js" type="text/javascript"></script>
    <title>Time</title>
</head>
    
<script>
    $(function(){
        <?php
            session_start();
            ini_set('session.gc_maxlifetime', 360000);
            if(isset($_COOKIE["session"]) && !isset($_SESSION["email"]))
                echo 'login('.$_COOKIE["session"].')';
            if(isset($_SESSION["email"])){
                echo '$(".full").show();';
                echo '$(".logged").css({display:"block"});';
                echo 'search("default");';
                echo '$("body").removeClass("background_img");';
            } else {
                echo '$("body").addClass("background_img");';
                echo '$(".loading_wrap").css({display:"none"});';
                echo '$(".auth").show();';
            }
        ?>
    })
</script>

<div class=wrapper2></div>
<div class=wrapper>
    <div class=confirmation_panel>
        <span class=close>X</span><h3>Are you sure?</h3>
        <div><button id=delete_button>Delete</button><button id=cancel>Cancel</button></div>
    </div>
</div>    

<body>
    <nav>
        <ul class=left>
            <li>Timer</li>
        </ul>
        <ul class=right>
            <li class="suggestions menu_items">
                <img title="suggestions" src="source/imgs/suggestion.png">
                <div>
                    <textarea class=suggestion_text></textarea>
                    <div id=send_suggestion class=mybutton>Send</div>
                    <div class=suggestion_confirm></div>
                </div>
            </li>
            <li class="shortcuts menu_items">
                <img title="shortcuts" src="source/imgs/key.png">
                <ul>
                    <li><div>S</div><div>start/stop</div></li>
                    <li><div>D</div><div>focus</div></li>
                    <li><div>P</div><div>pause/resume</div></li>
                    <li><div>Y</div><div>- 5mins</div></li>
                    <li><div>X</div><div>- 1min</div></li>
                    <li><div>C</div><div>+ 1min</div></li>
                    <li><div>V</div><div>+ 5mins</div></li>
                </ul>
            </li>
            <li class=logged_li>
                <div class=logged>
                    <div class=user><?php echo explode("@", $_SESSION["email"])[0]; ?></div> | <div class=logout>Logout</div>
                </div>
            </li>
        </ul>
    </nav>
   
    <main>
        <div class=full>    
            <div class=panels>
                <img src="source/imgs/plus.png" title="Add New Panel" id=new_panel_button>
            </div>

            <div class=main_buttons>
                <div class=mybutton2 id=data>Data</div>
                <div class="mybutton2 back_button" id=graph>Graphs</div>
            </div>
            <div class="data text">
                <div id=search_default class=mybutton>Last records</div>
                <div class=select_range>
                    <div class=range_button>Select Time</div>
                    <ul>
                        <li>Yesterday</li>
                        <li>This Week</li>
                        <li>Last Week</li>
                        <li>This Month</li>
                        <li>Last Month</li>
                        <li>All</li>
                    </ul>
                </div>
                <input placeholder="Select Range" autocomplete=off id=datepicker>

                <div class=manual_add>
                    <div>
                        <label>Start</label>
                        <input autocomplete=off class="tail-datetime"> 
                        <label>End</label>
                        <input autocomplete=off class="tail-time">
                    </div>
                    <input class=manual_activity placeholder=activity>
                    <div class=manual_time></div>
                    <div class=mybutton id=manual_add>Add</div>
                </div>
                <div class="manual_button mybutton">Add Manually</div>

                <div class=data_display></div>
            </div>
            <div class="data graph">
                <div id=graph_default class=mybutton>Last Records</div>
                <div class=graph_range>
                    <div class=graph_range_button>Select Time</div>
                    <ul>
                        <li>Yesterday</li>
                        <li>This Week</li>
                        <li>Last Week</li>
                        <li>This Month</li>
                        <li>Last Month</li>
                    </ul>
                </div>
                <input placeholder="Select Range" autocomplete=off id=datepicker_graph>
                <div class=graph_wrapper>
                    <div class=graph_display>
                        <div class=day>
                            <div class=date></div>
                            <div class=graph_data></div>
                        </div>
                    </div>
                    <div class=stats></div>
                </div>
            </div>
        </div>
        <div class=auth>
            <div class=login_wrapper>
                <div>
                <div class=login_select>
                    <div>Login</div>
                    <div class=login_select_inactive>Register</div>
                </div>
                <div class=login>
                    <div id=login_error></div>
                    <input id=email placeholder=email>
                    <input id=pass type=password placeholder=password>
                    <input class=keep_in type="checkbox" checked><label>Keep in</label>
                    <div class=mybutton id=login>Login</div>
                    <div class=mybutton id=skip_login>Skip Login</div>
                </div>
                <div class="register hide">
                    <div id=reg_email_error></div>
                    <input id=reg_email placeholder=email>
                    <div id=reg_pass_error></div>
                    <input type=password id=reg_pass placeholder=password>
                    <div id=reg_pass2_error></div>
                    <input type=password id=reg_pass2 placeholder="repeat password">
                    <input class=keep_in type="checkbox" checked><label>Keep in</label>
                    <div class=mybutton id=register>Register</div>
                </div>
                </div>    
            </div>
        </div>
    </main>
    <div class=loading_wrap>
        <img src="source/imgs/loading.svg" class=loading>
    </div>
</body>
</html>