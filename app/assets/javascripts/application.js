// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require_tree .

var click;

function loadQuestion() { 
	$('.next').remove();
	$.ajax({
		type: 'GET', 
		dataType: 'json', 
		url: window.location.origin + '/questions.json',
		success: function(response) {
			var question = response['question'];
			var firstAns = response['first'];
			var secondAns = response['second'];
			$('.question').attr('id', question['id']);
			$('.question').html(question['body']);
			$('.answer:first-child').html(firstAns['name'] + ' (@' + firstAns['username'] + ')');
			$('.answer:last-child').html(secondAns['name'] + ' (@' + secondAns['username'] + ')');
			checkAnswer(response);
		},
		error: function(response) {
			console.log('error in loadQuestion ' + response);
		}
	});
	click = 0;
}

function checkAnswer(response) {
	var questionParam = response['question']['parameter'];
	var firstAns = response['first'];
	var secondAns = response['second'];
	switch(questionParam) {
		case 'followers_count':
			$('.answer:first-child').attr('id', ' has ' + firstAns['followers_count'] + ' followers');
			$('.answer:last-child').attr('id', ' has ' + secondAns['followers_count'] + ' followers');
			most();
			break;
		case 'friends_count':
			$('.answer:first-child').attr('id', ' follows ' + firstAns['friends_count']);
			$('.answer:last-child').attr('id', ' follows ' + secondAns['friends_count']);
			most();
			break;
		case 'statuses_count':
			$('.answer:first-child').attr('id', ' has ' + firstAns['statuses_count'] + ' tweets');
			$('.answer:last-child').attr('id', ' has ' + secondAns['statuses_count'] + ' tweets');
			most();
			break;
		case 'creation_date':
			$('.answer:first-child').attr('id', ' has been on Twitter since ' + firstAns['creation_date']);
			$('.answer:last-child').attr('id', ' has been on Twitter since ' + secondAns['creation_date']);
			oldest();
			break
		default:
			console.log('error in checkAnswer!');
	}
	// console.log(response);
}

function most() {
	$('.answer').on('click', function(event){
		event.preventDefault();
		if (click < 1) {
			click ++;
			( $(this).attr('id') > $(this).siblings('.answer').attr('id') ) ? createAnswer('correct') : createAnswer('wrong');
		}
	});
}

function oldest() {
	$(".answer").on('click', function(event){
		event.preventDefault();
		if(click < 1) {
			click++
			var date1 = new Date($(this).attr('id'));
			var date2 = new Date($(this).siblings('.answer').attr('id'));
			( date1.getTime() > date2.getTime() ) ? createAnswer('correct') : createAnswer('wrong');
	  }
	});
}

function createAnswer(attr) {
	var userId = $('.user').attr('id');
	var questionId = $('.question').attr('id');
	var url = window.location.origin + '/questions/' + questionId;
	var data = {
		'user_id': userId,
		'question_id': questionId
	}
	if (attr == 'correct') {
		url += '/create_right_answer';
		data['is_correct?'] = true
	}
	else {
		url += '/create_wrong_answer';
		data['is_correct?'] = false
	}
	$.ajax({
		type: 'POST',
		dataType: 'json',
		url: url,
		data: data,
		success: function(response, status, jqXHR){
			console.log('answer created!');
		},
		error: function(response){
			console.log('error in createAnswer ' + response);
		}
	});
	$('.question').html(attr + '!');
	$('.answer').each(function(){
		$(this).append( $(this).attr('id') );
	});
	next();
}

function next() {
	$('.quizDialog div').append('<button class="next">Next</button>');
	$('.next').on('click', function(event){
		loadQuestion();
	});
}

function updateScoreboard(){
	$(".close").on("click", function(){
		$.ajax({
			type: "GET",
			dataType: "json",
			url: window.location.origin + "/users.json",
			success: function(response){
				$(".scoreboard").children().remove()
				for(var i = 0; i < response.length; i++){
					$(".scoreboard").append("<li><p>" + response[i]["email"]+ "</p><p>Score: " + response[i]["score"] + "</p><div class='bar-wrap'><span class='bar-fill' style='width: " + (response[i]["score"]/response[0]["score"]) * 100 + "%;'></span></div></li>");
				}
			},
			error: function(response){
				console.log("error");
			}
		});
	});
}

