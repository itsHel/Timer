var myVars = {
    watches: [],
    scrollingPaused: true,
    preLastDate: "",
    lastSearch: "",
    mainInterval: 0,
    lastGraph: "default",
    panels: [],
    doughnut:{
        labels:[],
        values:[]
    }
}


function stopWatch(index){
    let isPaused = false;
    let running = false;
    let clear = false;
    let activity;
    
    this.timer = 0;
    this.startTime = 0;

    this.start = function(){
        this.running = true;
        $(".panel#"+index+" input").addClass("running");
        $(".panel#"+index+" .play_button img").attr("src","source/imgs/stop.png").attr("title","Stop");
        $(".panel#"+index+" .pause_button").css({visibility:"visible"});
        $(".panel#"+index+" .cancel_button").css({visibility:"visible"});
        $(".panel#"+index+" .time").text(secondsToTime(this.timer));
        this.startTime = + new Date();
        if(!myVars.mainInterval){
            myVars.mainInterval = setInterval(updateAll, 1000);
        }
    }
    this.stop = function(cancelled = false){
        if(this.activity){                                          
            this.save(this.activity);
        } else if(!cancelled){
            $("#"+index+" input").addClass("blink");
            setTimeout(function(){
                $("#"+index+" input").removeClass("blink");
            }, 1200);
            return;
        }
        $("#"+index+" input").removeClass("running");
        $("#"+index+" .play_button img").attr("src","source/imgs/start.png").attr("title","Start");
        $("#"+index+" .pause_button").css({visibility:"hidden"});
        document.title = "Time";
        $("#"+index+" .cancel_button").css({visibility:"hidden"});
        $("#"+index+" .time").text("");
        this.resume();
        this.running = false;
        if(this.clear)
            $("#"+index+" input").val("").focus();
        for(let i = 0; i < myVars.watches.length; i++){             //stop main interval if nothing is running
            if(myVars.watches[i].running == true)
                break;
            if(i == myVars.watches.length - 1){
                clearInterval(myVars.mainInterval);
                myVars.mainInterval = false;
            }
        }
        if(cancelled){
            this.timer = 0;
            return;
        }
        savePanels();
        this.timer = 0;
    }
    this.update = function(){
        if(this.isPaused)
            return;
        this.timer++;
    }
    this.add_time = function(seconds){                                               //+-1/5 min
        this.timer+= seconds;
        this.timer = (this.timer < 0) ? 0 : this.timer;
        let time = (this.timer == 0) ? secondsToTime(0) : secondsToTime(this.timer);
        $("#"+index+" .time").text(time);
        document.title = remove_zeros(time) + " - " + this.activity;
    }
    this.save = function(activity){
        if(this.timer){
            $.post("source/php/save.php", {activity:activity, duration:this.timer, start:this.startTime/1000, end:(+ new Date())/1000}, function(echo){
                if(echo != "ok")
                    console.log(echo); 
                else {
                    search("default","",true);                                                         //default UPDATE      DISABLE?
                }
            });
        }
    }
    this.pause = function(){
        $("#"+index+" .pause_button img").attr("src","source/imgs/start.png");
        $("#"+index+" .pause_button img").attr("title","Continue");
        this.isPaused = true;
    }
    this.resume = function(){
        $("#"+index+" .pause_button img").attr("src","source/imgs/pause.png");
        $("#"+index+" .pause_button img").attr("title","Pause");
        this.isPaused = false;
    }
}

function updateAll(){
    myVars.watches.forEach(function(watch, index){
        if(!watch.running || watch.isPaused || !watch)
            return;
        watch.timer++;
        var time = secondsToTime(watch.timer);
        $("#"+index+" .time").text(time);
        document.title = remove_zeros(time) + " - " + myVars.watches[index].activity;    
    });
}

function savePanels(){
    myVars.panels = [];
    $(".watch_activity").each(function(i, ele){
        myVars.panels.push($(this).val());
    });
    localStorage.setItem($(".user").text(), JSON.stringify(myVars.panels));
}

function createPanel(){
    let index = myVars.watches.length;
    createPanelDiv(index);
    setPanelButtons(index);
    myVars.watches[index] = new stopWatch(index);
    $("#"+index+" .input_wrap input").focus();
    $("#"+index+" .input_wrap input").on("focus", function(){
        $(this).select();
    });
    savePanels();
}

function checkTime(x){
    if(x < 10)
        x = "0" + x;
    return x;
}

function lastMonthDayCount(){
    let x = new Date();
    x.setMonth(x.getMonth() -1);
    return new Date(x.getFullYear(), x.getMonth() +1, 0).getDate();
}

function addDate(date, days){
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function secondsToTime(seconds){
    var hours = Math.trunc(seconds / 3600);
    var minutes = Math.trunc(seconds % 3600 / 60);
    var seconds = Math.trunc(seconds % 60);
    return checkTime(hours) + ":" + checkTime(minutes) + ":" + checkTime(seconds);
}

function showManualTime(){
    let start = $(".tail-datetime").val().slice(-8).timeToSeconds();
    let end = $(".tail-time").val().timeToSeconds();
    if(start == "" || isNaN(start) || isNaN(end) || end == "")
        return;
    let addTime;
    if(start < end)
        addTime = bold_zeros(secondsToTime(end - start));
    else
        addTime = bold_zeros(secondsToTime(end + (24*3600 - start)));
        
    $(".manual_time").html(addTime);
}

jQuery.fn.extend({
    slideFadeToggle: function(time = 400, fadeTime = time){
        let myheight, myopacity;
        if($(this).css("opacity") == 0){
            myheight = $(this).get(0).scrollHeight;
            myopacity = 1;
        } else {
            myheight = 0;
            myopacity = 0;
        }
        $(this).animate({
            height: myheight
        }, {duration:time, queue:false});
		$(this).animate({
            opacity: myopacity
        }, {duration:fadeTime, queue:false});
    } 
});

function remove_zeros(time){
    while(time.charAt(0) == "0" || time.charAt(0) == ":"){
        time = time.substr(1);
    }
    if(time == "")
        return "0";
    return time;
}
function bold_zeros(time){
    for(let i = 0; i < time.length ;i++){
        if(time.charAt(i) != "0" || time.charAt(i+1) != "0")
            if(time.charAt(i) != ":" && time.charAt(i+1) != ":"){
                time = time.insert(i+2, "</b>");
                time = time.insert(i, "<b>");
                break;
            }
    }
    return time;
}

String.prototype.insert = function(index, string){
    if(index > 0)
        return this.slice(0, index) + string + this.slice(index);
    else
        return string + this;
}
String.prototype.timeToSeconds = function(){
    var array = this.split(":");
    return parseInt(array[0]*3600) + parseInt(array[1]*60) + parseInt(array[2]);
}
String.prototype.date_filter = function(){
    var now = new Date();
    var day = String(now.getDate()).padStart(2, 0);
    var month = String(now.getMonth()+1).padStart(2, 0);
    var year = now.getFullYear();
    var yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    var yday = String(yesterday.getDate()).padStart(2, 0);
    var ymonth = String(yesterday.getMonth()+1).padStart(2, 0);
    var yyear = yesterday.getFullYear();

    if(this.slice(0,4) == year){            // same year
        if(this == year + "-" + month + "-" + day){
            return "Today";
        } else {
            if(this == yyear + "-" + ymonth + "-" + yday){
                return "Yesterday";
            } else{
                return this.substr(5);
            }
        }
    } else {
        return this;
    }
}

function delete_row(id){
    $.post("source/php/delete.php", {id:id}, function(echo){
        if(echo != "ok")
            alert(echo);
        else {
            search("default", "", true);                                                            //default UPDATE    DISABLE?
        }
    });
}

function scroll_view(ele){
    var scrollto = ele.offset().top + ele.height();
    var windowpos = window.innerHeight + window.scrollY;
    if(windowpos < scrollto){
        var move = (scrollto - windowpos + 20) / 40;
        scrollStep(Math.ceil(move), 40);
    }
}
function scrollStep(move, x){
    setTimeout(function(){
        window.scrollTo(0, window.scrollY + move);
        if(x-- != 0)
            scrollStep(move, x);
    },1);
}

$(function(){           //init
    //datepickers
    var picker = new Lightpick({ field: document.getElementById('datepicker'), format: "YYYY-MM-DD", singleDate: false, numberOfMonths:2, 
                                    onSelect: function(data){
                                        let dates = $("#datepicker").val().split(" - ");
                                        if(dates[1].match(/\d/))
                                            search(dates[0], dates[1], true);
                                    }
                               });
    var picker_graph = new Lightpick({ field: document.getElementById('datepicker_graph'), format: "YYYY-MM-DD", singleDate: false, numberOfMonths:2, 
                                    onSelect: function(data){
                                        let dates = $("#datepicker_graph").val().split(" - ");
                                        if(dates[1].match(/\d/))
                                            search_graph(dates[0], dates[1]);
                                    }
                               });
    
    $("#manual_add").on("click", function(){
        let addStart = $(".tail-datetime").val();
        let addEnd = $(".tail-time").val();
        let activity = $(".manual_activity").val();
        if(activity){
            $.post("source/php/save.php", {start:addStart, end:addEnd, activity:activity, manual:true}, function(echo){
                 if(echo == "ok"){
                    $(".wrapper2").click();
                    search("default","",true);  
                    $(".manual_activity").val("");
                    tail.DateTime(".tail-datetime").remove();
                    tail.DateTime(".tail-time").remove();
                 } else {
                     alert(echo);
                 }
            });
        } else {
            $(".manual_activity").addClass("blink");
            setTimeout(function(){
                $(".manual_activity").removeClass("blink");
            }, 1200);
        }
    });
    
    $(".manual_activity").on("keypress", function(e){
        if(e.keyCode == 13){
            $("#manual_add").click();
        }
    });
    
    $(".tail-datetime, .tail-time").on("input", showManualTime);
    $(".manual_button").on("click", function(e){
        $(".manual_add").fadeToggle();
        $(".wrapper2").fadeToggle();
        scroll_view($(".manual_add"));
        tail.DateTime(".tail-datetime", {stayOpen:true});
        tail.DateTime(".tail-time", {dateFormat:false, stayOpen:true});
        tail.DateTime(".tail-datetime").open();
        tail.DateTime(".tail-time").open();
        tail.DateTime(".tail-datetime").selectDate(new Date())
        tail.DateTime(".tail-time").selectDate(new Date())
        $(".manual_time").html("");
    });
    $(".wrapper2").on("click", function(e){
        $(".manual_add").fadeOut();
        $(".wrapper2").fadeOut();
        $(".suggestions > div").fadeOut();
        tail.DateTime(".tail-datetime").remove();
        tail.DateTime(".tail-time").remove();
    });
    ///////////////////////////////////////
    
    //scrolling down
    $(window).on("scroll", function(){
        if($(window).scrollTop() + $(window).height() == $(document).height())
            search_scroll();
    });
    
    //selects
    $(".range_button, .select_range ul").on("click", function(){
        $(".select_range ul").slideFadeToggle(300, 200); 
    });
    $(".select_range li").on("click", function(){
        search($(this).text().toLowerCase(), "", true);
        $(".range_button").text($(this).text());
    });
    $(".graph_range_button, .graph_range ul").on("click", function(){
        $(".graph_range ul").slideFadeToggle(300, 200);
    });
    $(".graph_range li").on("click", function(){
        search_graph($(this).text().toLowerCase()); 
        $(".graph_range_button").text($(this).text());
    });
    
    $(".shortcuts").on("click", function(){
        $(".shortcuts ul").fadeToggle();
    });
    $(".suggestions").on("click", function(e){
        if(e.target.tagName.toLocaleLowerCase() == "img"){
            $(".suggestions > div").fadeToggle();
            $(".wrapper2").fadeIn();
            $(".suggestion_text").focus();
        }
    });
    $("#search_default").on("click", function(){
        search("default", "", true);
    });
    $("#graph_default").on("click", function(){
        search_graph("default");
    });
    $("#send_suggestion").on("click", function(){
        let text = $(".suggestion_text").val();
        if(!text){
            return;
        }
        $.post("source/php/suggestion_mail.php", {text:text}, function(echo){
            if(echo == "ok"){
                $(".suggestion_confirm").text("ok");
                $(".suggestion_text").val();
                setInterval(function(){
                    $(".wrapper2").click();
                }, 300);
            } else {
                console.log("error");
            }
        })
    });
    $("#data").on("click", function(){
        $(".text").fadeIn(300);
        setTimeout(function(){
            myVars.scrollingPaused = false; 
        }, 500);
        $(".graph").fadeOut(0);
        $(this).removeClass("back_button");
        $("#graph").addClass("back_button");
    });
    $("#graph").on("click", function(){
        myVars.scrollingPaused = true;    
        $(".text").fadeOut(0);
        $(".graph").fadeIn(300);
        search_graph(myVars.lastGraph);  
        $(this).removeClass("back_button");
        $("#data").addClass("back_button");
    });
    
    $(".login_select > div").on("click", function(e){
         if($(e.target).hasClass("login_select_inactive")){
             $(e.target).siblings().addClass("login_select_inactive");
             $(e.target).removeClass("login_select_inactive");
             $(".hide").removeClass("hide").siblings(".register, .login").addClass("hide");
         }
    });
    $(".manual_activity").autocomplete({
        source: function(request, response){
            $.post("source/php/search.php", {expression: request.term}, function(echo){
                let suggestions = echo.slice(0,-1).split(";");
                if(suggestions[0] == "")
                    suggestions = [];
                response(suggestions);
            });
        }
    });
    //shortcuts
    $(window).on("keyup", function(e){
        if(e.target.tagName.toLocaleLowerCase() == "input" || e.target.tagName.toLocaleLowerCase() == "textarea"){
            if(e.keyCode == 27){
                e.target.blur();
            }
            return;
        }
        if(e.keyCode == 27){
            $(".wrapper").fadeOut(200);
        }
        switch(e.key){
            case "s":
                $(" .play_button").eq(0).click();
                break;
            case "d":
                $(".input_wrap input").eq(0).focus();
                break;
            case "p":
                $(".pause_button").eq(0).click();
                break;
            case "y":
                $(".panel_display").eq(0).find(".myicon").eq(0).click();
                break;
            case "x":
                $(".panel_display").eq(0).find(".myicon").eq(1).click();
                break;
            case "c":
                $(".panel_display").eq(0).find(".myicon").eq(2).click();
                break;
            case "v":
                $(".panel_display").eq(0).find(".myicon").eq(3).click();
                break;
        }
    });
    
    //load panels
    myVars.panels = (localStorage.getItem($(".user").text()) == null) ? [""] : JSON.parse(localStorage.getItem($(".user").text()));
    for(let i = 0; i < myVars.panels.length; i++){
        createPanelDiv(i);
        setPanelButtons(i);
        myVars.watches[i] = new stopWatch(i);
        myVars.watches[i].activity = myVars.panels[i];
        $(".watch_activity").eq(i).val(myVars.panels[i]);
    }
    
    //logins
    $(".login input").on("keypress", function(e){
        if(e.keyCode == 13)
            login();
    });
    $("#login").on("click", login);
    $("#skip_login").on("click", login_test);

    $(".register input").on("keypress", function(e){
        if(e.keyCode == 13)
            register();
    });
    $("#new_panel_button").on("click", createPanel);    
    $("#register").on("click", register);

    $("#reg_email").on("keyup", function(){
        email_check($(this).val(), $("#reg_email_error"));
    });
    $("#reg_pass").on("keyup", function(){
        pass_check($(this).val(), $("#reg_pass_error"));
        if($("#reg_pass2").val() != "")
            pass2_check($(this).val(), $("#reg_pass2").val(), $("#reg_pass2_error"));
    });
    $("#reg_pass2").on("keyup", function(){
        pass2_check($(this).val(), $("#reg_pass").val(), $("#reg_pass2_error"));
    });
    
    $(".logged .logout").on("click", function(){
        logout(); 
    });
    
    $("#cancel, .close").on("click", function(){
        $(".wrapper").fadeOut(200);
    });
    $(".wrapper").on("click", function(e){
        if(e.target.classList.contains("wrapper"))
            $(this).fadeOut(200);
    });
    
    const preload_imgs = ["source/imgs/stop.png", "source/imgs/clear_red.png"];
    preload(preload_imgs);
    
});     //init end

function preload(images){
    $(images).each(function(){
        $("<img/>")[0].src = this;
    });
}
function login(session = ""){
    var email = $("#email").val();
    var pass = $("#pass").val();
    var keep = $(".keep_in").eq(0).is(":checked") || $(".keep_in").eq(1).is(":checked");
    if(!(email) || !(pass))
        return;
    
    $.get("source/php/login.php", {email:email, pass:pass, keep_in:keep, session:session}, function(echo){
        if(echo.substring(0,3) == "ok"){
            $("#login_email_error").text("");
            $("#login_pass_error").text("");
            location.reload();
        } else if (echo == "not_found")
            $("#login_error").text("Wrong credentials");
        else 
            $("#login_error").text("I just dont know what went wrong...");
    });
}

function login_test(){
    $.get("source/php/login.php", {email:"test", pass:"", keep_in:false}, function(echo){
        if(echo.substring(0,3) == "ok")
            location.reload();
        else
            console.log(echo);
    });
}

function logout(){
    $.get("source/php/login.php", {logout:1}, function(echo){
         if(echo.substring(0,3) == "ok"){
             location.reload();
         }
    });
}

function register(){
    var validation = true; 
    $(".register input").each(function(){
        if($(this).val() == "" || $(this).next("div").text() != "")
            validation = false;
    });
    if(!validation){
        console.log("bad validation")
        return;
    }
    var email = $("#reg_email").val();
    var pass = $("#reg_pass").val();
    console.log("posted");
    $.post("source/php/register.php", {email:email, pass:pass}, function(echo){
        if(echo != "ok")
            $("#reg_email_error").text("I just dont know what went wrong...")
        else {
            $("#email").val(email);
            $("#pass").val(pass);
            login();
        }
    });
}

function search_graph(from, till = "", clear = true){
    from = from.toLocaleLowerCase();
    myVars.lastGraph = from;
    let trueRender = true;
    $.get("source/php/search_graph.php", {from:from, till:till}, function(echo){
        search_data = JSON.parse(echo);
        if(search_data == false){
            $(".graph_display .date").html("<h3>No results</h3>");
            $(".graph_data").html("");            
            return;
        }
        //stats
        let stats = search_data.reduce(function(a, b){
            if(a[b.activity]){
                a[b.activity] += b.duration;
            } else {
                a[b.activity] = b.duration;
            }
            return a;
        }, {});
        let temp = [];
        for(let key in stats){
            temp.push([key,stats[key]]);
        }
        temp.sort(function(a, b){
            return (a[1] < b[1]) ? 1 : -1;
        });
        let stats_html = "";
        temp.map(function(ele){
            let timeSpend = secondsToTime(ele[1]);
            if(ele[1] > 172800){        //two days
                timeSpend = Math.floor(ele[1]/86400) + " days, " + bold_zeros(secondsToTime(ele[1]%86400));
            } else {
                timeSpend = bold_zeros(timeSpend);
            }
            stats_html += "<div class=stats_row><div class=stats_act>" + ele[0] + "</div><div class=stats_time>" + timeSpend + "</div></div>";    
        }).join("");    
        $(".stats").html("").append(stats_html);
        //
        var Xlabel = {};
        var Xaxis;
        if(from == "default" || from == "yesterday" || from == till){
            Xaxis = "activity";                     //graph in activities - single day
        } else {
            Xaxis = "start";                        //graph in days
            Xlabel = {text: "Day"};
            
            //fill empty dates
            let d = new Date();
            let dateRange, dates = [];
            if(from.match(/week/)){
                if(from == "this week")   
                    dateRange = (d.getDay() == 0) ? 7 : d.getDay();
                else
                    dateRange = 7;
                dates = [0,1,2,3,4,5,6];
            } else {
                var dayIndex = 0;
                if(from == "this month")   
                    dateRange = d.getDate();
                else if(from == "last month")
                    dateRange = lastMonthDayCount();
                else {                                  //date range
                    dayIndex = 0;
                    //dayIndex = parseInt(from.slice(-2));
                    dateRange = 0;
                    //dateRange = parseInt(till.slice(-2)) - dayIndex;
                }
                for(let i = dayIndex; i < dateRange + dayIndex; i++){
                    dates.push(d.getFullYear() + "-" + checkTime(d.getMonth() + ((from == "last month") ? 0 : 1)) + "-" + checkTime(i +1));
                }
            }
            for(let i = 0; i < dateRange; i++){
                    search_data.unshift({"activity":"", "duration":0, "start":dates[i], "startTime":"", "endTime":""});
            }
            search_data.sort(function(a, b){
                var x = a.start;    
                var y = b.start;
                return x < y ? -1 : 1;
            });
            //for week
            if(from.match(/week/) != null){
                for(let i = 0; i < search_data.length; i++){
                    dates = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                    search_data[i].start = dates[search_data[i].start];
                }
            }
        }
        
        $(".graph_data").html("").addClass("graph_active");
        if(from == "default" || from == "yesterday")
            $(".graph_display .date").html(search_data[0]["start"].slice(0,10).date_filter());
        else
            $(".graph_display .date").html((till == "" || till == from) ? from : from + " / " + till);
        
        //change time axis units
        let max, Yunits;
        for(let i = 0; i < search_data.length; i++){
            if(!i)
                max = search_data[0].duration;
            try {max = (max < search_data[i+1].duration) ? search_data[i+1].duration : max;} catch(e){}
        }
        for(let i = 0; i < search_data.length; i++){
            if(max > 3600){
                search_data[i].duration/=3600;
                Yunits = "[h]"
            } else if(max > 60){
                search_data[i].duration/=60;
                Yunits = "[m]";
            } else Yunits = "[s]";
        }
        //render
        let wrapperWidth = $(".data.graph").css("width");
        let graphWidth = $(".graph_active").css("width");
        console.log(wrapperWidth);
        
        $(".graph_active").css({width:"auto"});
        $(".data.graph").css({minWidth:"auto"});
        var chart = new_graph(search_data, Xaxis, Xlabel, Yunits);
        chart.on('render', () => {
            if(!trueRender){
                //stop graph resizing
                $(".graph_active").css({width:graphWidth});
                $(".data.graph").css({minWidth:wrapperWidth});
            }
        });
        chart.renderTo(".graph_data");
        scroll_view($(".graph_data"));
        trueRender = false;
    });
}

function search_scroll(){
    if(myVars.scrollingPaused || myVars.lastSearch.match(/(week|month)/) != null)
        return;
    search(myVars.preLastDate);
}

function search(from, till = "", clear = false){
    myVars.scrollingPaused = true;
    $(".loading").css({visibility:"visible"});
    $.get("source/php/search.php", {from:from, till:till}, function(echo){
        $(".loading").css({visibility:"hidden"});
        if(echo == "no connection"){
            $(".data_display").append("<h3>Cant connect to database</h3>");
            myVars.scrollingPaused = true;
            return;
        }
        myVars.lastSearch = from;
        echo = echo.split(";;;");
        let search_data = JSON.parse(echo[0]);                  // MAIN rows
        let search_data_split = JSON.parse(echo[1]);            // SUB rows
        if(clear){
            $(".data_display").html("");
            $(".meter").css({width:0});
            myVars.doughnut.labels = [];
            myVars.doughnut.values = [];
        }
        if(!search_data.length){
            $(".data_display").append("<h3>No results</h3>");
            myVars.scrollingPaused = true;
            return;
        }
        let fulltime = 0;
        let i = 0;
        let temp_date, day;
        let daydata = [];
        //create rows
        let xdata = search_data.forEach(function(segment, index){
            if(fulltime == 0 || temp_date != segment.start.slice(0,10)){         //new day
                set_day(segment.start.slice(0,10), index);
            }
            //subrows
            let subrows = [];
            let full_row = "<div class=full_row>" + make_row(segment, true);
            full_row+= "<div class=sub_row data-duration=" + segment.duration + ">";
            if(segment.count > 1){
                while(i < search_data_split.length && segment.activity == search_data_split[i].activity && search_data_split[i].start.slice(0,10) == temp_date){
                    subrows.push(make_row(search_data_split[i]));
                    i++;
                }
            } else {
                i++;
            }
            subrows.sort(function(a, b){
                return b.match(/duration>(.+?)<\/div>/)[1].replace(/(<b>|<\/b>)/g,"").timeToSeconds() - a.match(/duration>(.+?)<\/div>/)[1].replace(/(<b>|<\/b>)/g,"").timeToSeconds();
            });
            if(i > 1)
                full_row+= subrows.join("");
            full_row+= "</div></div>";
            //
            daydata.push(full_row);
            fulltime+= segment.duration;
            //PRELASTDATE for scroll search
            if(index + 1 == search_data.length){                        //last day
                set_day(segment.start.slice(0,10), index);             
                let date = new Date(segment.start.slice(0,10));
                date = addDate(date, -1);
                myVars.preLastDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
                myVars.doughnut.labels.splice(-1,1);
                myVars.doughnut.values.splice(-1,1);
                console.log(myVars.doughnut);
            }
        });
        //////////////////////////
        
        $(".row .delete img").unbind("click").on("click", function(){
            console.log($(".wrapper"));
            $(".wrapper").fadeIn(300);
        });
        $(".full_row").each(function(){                                        //add ids from sub rows
            var full_id = "";
            $(this).find(".sub_row .row img").each(function(){
                full_id+= $(this).data("id") + ",";
            });
            full_id = full_id.slice(0,-1);
            if(full_id != "")
                $(this).find("img").eq(0).data("id",full_id);
            $(this).find("img").eq(0).attr("src","source/imgs/delete.png");
        });

        $(".sub_row .meter").addClass("meter_sub");    

        $(".full_row").unbind("click").on("click", function(e){                 //add opening main rows
            if(e.target.tagName.toLocaleLowerCase() == "img"){    
                $(".wrapper").fadeIn(300).find("#delete_button").data("id", $(e.target).data("id"));
            } else {                    
                $(this).find(".sub_row .row").each(function(segment){
                    if($(this).parent().css("display") == "none")
                        $(this).find(".meter").animate({width: ($(this).find(".duration").text().timeToSeconds()/$(this).parent().data("duration")*100)*$(this).parent().parent().data("duration_percent") + "%"}, 300); 
                    else
                        $(this).find(".meter").animate({width: "0"}, 200);
                });
                $(this).find(".sub_row").slideToggle(400);
                myVars.scrollingPaused = true;
                setTimeout(function(){
                    myVars.scrollingPaused = false;
                }, 1000);
                scroll_view($(this));
            }
        })
        .each(function(){
            if($(this).find(".sub_row").html() != "")
                $(this).css({cursor:"pointer"});
        });
        
        $("#delete_button").unbind("click").on("click", function(){
            delete_row($(this).data("id"));
            $(".wrapper").fadeOut(200);
        });
        
        $(".day_chart img").on("click", function(){
            let i = $(this).parents(".day").index();
            let element = $(this).next("div");
            new_day_chart(myVars.doughnut.labels[i], myVars.doughnut.values[i], i);
            
            $(element).fadeIn();
            $(element).on("click", function(){
                $(this).fadeOut().find("canvas").empty();
            });
            scroll_view($(element));
        });

        $(".day").each(function(){                                                              //main meters
            let day_duration = $(this).data("day_duration");                
            $(this).find(".full_row").each(function(){
                if($(this).find(".row .meter").css("width") == "0px"){
                    var act_duration = $(this).find(".sub_row").data("duration");
                    $(this).find(".row .meter").eq(0).animate({width: act_duration/day_duration*100 + "%"}, 200).parents().eq(2).data("duration_percent", act_duration/day_duration); 
                }
            });
        });

        if(till != "week" && till != "month");
            setTimeout(function(){myVars.scrollingPaused = false;},1000);
                        
        function make_row(row, main = false){                                                               
            return ["<div class=row>",
                   "<div class=number>" + row.count + "</div>",
                   "<div class=activity>" + row.activity + "</div>",
                   "<div class=bar><div class=meter></div></div>",
                   "<div class=duration>" + ((main) ? "<div class=total></div>" : "") + bold_zeros(secondsToTime(row.duration)) + "</div>",
                   "<div class=from_time>" + row.start.substr(-8).slice(0,-3) + " - " + row.myend.substr(-8).slice(0,-3) + "</div>",
                   "<div class=delete><img data-id='" + row.id + "' src='source/imgs/cancel.jpg'></div>",
                   "</div>"
               ].join("\n");
        }
        function set_day(date, index){                     //ends current day + set new one
            if(fulltime != 0){                             //skip on first day
                daydata.sort(function(a, b){
                    return parseInt(b.match(/data-duration=(\d+)/)[1]) - parseInt(a.match(/data-duration=(\d+)/)[1]);
                }); 
                day+= daydata.join("") + "</div>";
                day = day.insert(4, " data-day_duration=" + fulltime);
                $(".data_display").append(day);
                $(".day:last-of-type .full_row:nth-of-type(2) .total").eq(0).html(bold_zeros(secondsToTime(fulltime)));
                daydata = [];
                fulltime = 0;  
            }
            temp_date = date;
            day = "<div class=day><div class=day_top><div class=date>" + temp_date.date_filter() + "</div><div class=day_chart><img src='source/imgs/doughnut.png'><div><canvas></canvas></div></div></div>";
            //create graph data
            myVars.doughnut.labels.push([]);
            myVars.doughnut.values.push([]);
            for(let o = index; true; o++){
                if(o == search_data.length || temp_date != search_data[o].start.slice(0,10))
                    break;
                myVars.doughnut.labels[myVars.doughnut.labels.length -1].push(search_data[o].activity);
                myVars.doughnut.values[myVars.doughnut.labels.length -1].push(search_data[o].duration);
            }
        }
    });
}

function email_check(string, output){
    if(string.length > 0){
        if(!string.match(/^\S+@\S+$/) || string.length > 40)
            $(output).text("Bad format")
        else{
            $(output).text("...");
            $.get("source/php/login_taken.php", {email:string}, function(echo){
                if(echo != "ok")
                    $(output).text("email taken!");
                else
                    $(output).text("");
            });
        }
    }
}
function pass_check(string, output){
     if(string.length < 6)
        $(output).text("At least 6 characters");
    else if(!string.match(/\d/))
        $(output).text("At least one number");
        else if(!string.match(/[a-zA-Z]/))
            $(output).text("At least one letter");
            else
                $(output).text("");
}
function pass2_check(string, pass1, output){
    if(string != pass1)
        $(output).text("Passwords do not match");
    else
        $(output).text("");
}

function new_graph(data, Xaxis, Xlabel, Yunits){
    var chart = new Taucharts.Chart({
            guide: {
                x: {label: Xlabel},
                y: {label: {text: "Duration " + Yunits}},
                color:{
                    brewer: ['#d0d1e6','#a6bddb','#74a9cf','#3690c0','#0570b0','#045a8d','#023858'].reverse()
                }
            },
            type: 'stacked-bar',
            x   : Xaxis,
            y   : 'duration',
            data: data,
            color: "activity",
            plugins: [
                Taucharts.api.plugins.get('tooltip')({
                    fields: ["activity", "duration", "startTime", "endTime"],
                    formatters: {
                        startTime: {
                            label: "Start",
                            format: function(n){
                                if(!n) return "";
                                let temp = n.slice(0,-3).split(" ");
                                n = temp[1] + " / " + temp[0];
                                return n;      
                            }
                        },
                        endTime: {
                            label: "End",
                            format: function(n){
                                if(!n) return "";
                                let temp = n.slice(0,-3).split(" ");
                                n = temp[1] + " / " + temp[0];
                                return n;      
                            }
                        },
                        duration: {
                            label: "Duration",
                            format: function(n){
                                if(!n) return "";
                                if(Yunits == "[h]"){
                                    n*= 3600;
                                } else if(Yunits == "[m]"){
                                    n*= 60;
                                }
                                return secondsToTime(n);
                            }
                        },
                        activity: {
                            label: "Activity"
                        }
                    }
                }),
                Taucharts.api.plugins.get('crosshair')()
            ]
    });
    return chart;
}
    
function createPanelDiv(id){
    let panel = `<div class=panel id=${id}>
                    <div class=bar_wrapper>
                        <div class=input_wrap><input placeholder=Activity class=watch_activity spellcheck=false><img class=auto_clear title="Clear on stop - OFF" src="source/imgs/clear.png"></div>
                        <div class=play_button><img title="Start" src="source/imgs/start.png"></div>
                        <div class=pause_button><img title="Pause" src="source/imgs/pause.png"></div>
                        <div class=cancel_button><img title="Cancel" src="source/imgs/cancel.jpg"></div>
                    </div>
                    <div class=panel_display>
                        <div class=myicons>
                            <div title="- 5 minutes" class=myicon><img src="source/imgs/minus.png"><img src="source/imgs/minus.png"></div>
                            <div title="- 1 minute" class=myicon><img src="source/imgs/minus.png"></div>
                        </div>
                        <div class=time></div>
                        <div class=myicons>
                            <div title="+ 1 minute" class=myicon><img src="source/imgs/plus.png"></div>
                            <div title="+ 5 minutes" class=myicon><img src="source/imgs/plus.png"><img src="source/imgs/plus.png"></div>
                        </div>
                    </div>
                    <img title="Close Panel" class=close_panel src="source/imgs/delete2.png">
                </div>`;
    $("#new_panel_button").before(panel);
}

function setPanelButtons(index){
    //let id = $(this).parents(".panel").attr("id");
    $(".panel#"+index+" input").on("keyup", function(e){
        if(e.keyCode == 13 && !myVars.watches[index].running){
            myVars.watches[index].start();
            $(this).blur();
        } else {
            myVars.watches[index].activity = $(".panel#"+index+" input").val();
        }
    });
    $(".panel#"+index+" input").autocomplete({
        source: function(request, response){
            $.post("source/php/search.php", {expression: request.term}, function(echo){
                let suggestions = echo.slice(0,-1).split(";");
                if(suggestions[0] == "")
                    suggestions = [];
                response(suggestions);
            });
        }
    });
    $(".panel#"+index+" .input_wrap input").on("keydown", function(e){
        if(e.keyCode == 192)
            return false;
    });
    
    $(".panel#"+index+" .cancel_button").on("click", function(){
        myVars.watches[index].stop(true);
    });
    
    $(".panel#"+index+" .play_button").on("click", function(){
        if(myVars.watches[index].running){
            myVars.watches[index].stop();
        } else {
            console.log("started");
            myVars.watches[index].start();
        }
    });
    $(".panel#"+index+" .pause_button").on("click", function(){
        if(!myVars.watches[index].isPaused){
            myVars.watches[index].pause();
        } else {
            myVars.watches[index].resume();
        }
    });  
    $(".panel#"+index+" .auto_clear").on("click", function(){
        if(myVars.watches[index].clear){
            myVars.watches[index].clear = false;
            $(this).attr("src","source/imgs/clear.png");
            $(this).attr("title","Clear on stop - OFF");
        } else {
            myVars.watches[index].clear = true;
            $(this).attr("src","source/imgs/clear_red.png");
            $(this).attr("title","Clear on stop - ON");
        }
    });  
    $(".panel#"+index+" .panel_display").each(function(){
        $(this).find(".myicon").eq(0).on("click", function(){
            myVars.watches[index].add_time(-300);
        });
        $(this).find(".myicon").eq(1).on("click", function(){
            myVars.watches[index].add_time(-60);
        });
        $(this).find(".myicon").eq(2).on("click", function(){
            myVars.watches[index].add_time(60);
        });
        $(this).find(".myicon").eq(3).on("click", function(){
            myVars.watches[index].add_time(300);
        });
    });
    $(".panel#"+index+" .close_panel").on("click", function(){
        $(".panel#" + index).remove();
        myVars.watches[index].stop(true);
        myVars.watches[index] = false;
        savePanels();
    });
}

function new_day_chart(labels, values, i){
    let ctx = $(".day_chart canvas").eq(i)[0].getContext('2d');
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values
            }]
        },
        options: {
            plugins: {
              colorschemes: {
                scheme: 'office.Forte6'
              }
            },
            legend: {
                position:"left"
            },
            tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    label: function(tooltipItems, data) { 
                        let index = tooltipItems.index;
                        return data.labels[index] + ': ' + secondsToTime(data.datasets[0].data[index]);
                    }
                }
            }
        }
    });
}