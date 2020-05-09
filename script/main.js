$(document).ready(function () {

  var headerBg = $('.header--bg');
  var searchInput = $('.nav__inputbox');
  var productsBox = $('.products');
  var apiKey = 'e689af11fd9023e87bb5c5b4fd5dde1e';
  var urlMovie = 'https://api.themoviedb.org/3/search/movie';
  var urlSerie = 'https://api.themoviedb.org/3/search/tv';
  var tubeKey = '';
  var urlConvert = '';
  // HANDLEBARS SETTINGS
  var source = $('#products__template').html();
  var template = Handlebars.compile(source);

  // FOCUS ON INPUTBOX
  searchInput.focus();

  // SEARCH PRODUCT WITH ENTER KEY
  searchInput.keyup(function(e){
    if (e.which == 13){
      addProduct()
    }
  });

  // PRODUCT CLICK
  $('#app').on('click', '.product', function() { 
    $('.jumbotron__trailer').hide();
    $('.jumbotron__wrapper').show();

    var img = $(this).find('.poster').attr('src');
    // RESIZE IMG
    img = img.replace("/w342/", "/w500/");
    // CHANGE IMG HEADER
    headerBg.css("background-image", "url('"+ img + "')"); 

    $('.jumbtron__title').text($(this).find('.product__title span').text());
    $('.jumbtron__vote').html($(this).find('.product__vote span').html());
    $('.jumbtron__overview').text($(this).find('.product__overview span').text());

    // GET TYPE AND ID TO CREATE YOUTUBE URL API
    var productType = ($(this).find('.product__type span').text())
    var movieId = $(this).attr('data-id');
    urlConvert = 'https://api.themoviedb.org/3/' + productType + '/' + movieId + '/videos?api_key=e689af11fd9023e87bb5c5b4fd5dde1e&language=en-US';
  });

  // CLICK TRAILER AND EXECUTE YOUTUBE API
  $('.resume').click(function(){
    $.ajax({
      url: urlConvert,
      method: 'GET',
      success: function(data){
        var result = data.results;
        tubeKey = result[0].key;
        htmlTrailer = '<iframe src="https://www.youtube.com/embed/' + tubeKey + '?autoplay=1&fs=0&controls=0" frameborder="0"></iframe>'
        $('.jumbotron__wrapper').hide();
        $('.jumbotron__trailer').html(htmlTrailer).show();
      },
      error: function(){
        console.log('errore bapi trailer');
      }
    })
  })

  /****************************************************
  * FUNCTIONS
  ****************************************************/
  
  // FUNCTION: ADD PRODUCT WITH HANDLEBARS
  function addProduct (){
    productsBox.children().remove();
    apiCall(urlMovie,'title','movie');
    apiCall(urlSerie,'name','tv');
    // CLEAN PRODUCTS BOX AND INPUTBOX VALUE
    searchInput.val('');
  }

  // FUNCTION: DYNAMIC API CALL
  function apiCall (url,nameFormat,type){
    var originalFormat = 'original_' + nameFormat;
    $.ajax({
      url: url,
      method: 'GET',
      data: {
        api_key: apiKey,
        query: searchInput.val().trim()
      },
      success: function(data){
        var result = data.results;
        for (let i = 0; i < result.length; i++){
          // CHECK ON POSTER
          var poster = '';
          if (!!result[i].poster_path){
            poster = 'https://image.tmdb.org/t/p/w342/' + result[i].poster_path;
          } else{
            poster = 'https://media.giphy.com/media/H7wajFPnZGdRWaQeu0/giphy.gif'
          }
          
          var product = {
          img: poster,
          title : result[i][nameFormat].toUpperCase(),
          original_title : result[i][originalFormat].toUpperCase(),
          original_language: flag(result[i].original_language),
          vote_average: stars(result[i].vote_average),
          type: type,
          overview: result[i].overview.substr(0, 70),
          id: result[i].id
          }
          // APPEND A PRODUCT
          var html = template(product);
          productsBox.append(html);
        }
      },
      error: function(){
        console.log('Api Error');
      }
    })
  }

  // FUNCTION: TRANSFORM VOTE TO STARS 1-5
  function stars(number){
    number = Math.ceil(number / 2);
    var result = '';
    var blankStars = (5 - number);   
    for (let i = 0; i < number; i++){
      result += '<i class="fas fa-star"></i>'
    }
    for (let i = 0; i < blankStars; i++){
      result += '<i class="far fa-star"></i>'
    }
    return result;
  }

  // FUNCTION: TRANSFORM LANGUAGE IN FLAGS (ONLY IT-EN)
  function flag(text){
    switch (text) {
      case 'it':
        return '<img src="img/en.svg" alt="en">'
      case 'en':
        return '<img src="img/it.svg" alt="it">'
      default:
        return text
    }
  }
  
});