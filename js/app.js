app.controller('appCtrl', ['$scope','$stamplay',
	function appCtrl($scope, $stamplay) {

	var user = $stamplay.User().Model
	
	user.currentUser().then(function(){
		$scope.$apply(function(){
			$scope.user = user.instance;
		})
	},function(err){
		/*manage error*/
	})

	$scope.fbLogin = function(){
		user.login('facebook')
	}
	$scope.logout= function(){
		user.logout();
	}

	$scope.openModal=function(currentAmount){
		$scope.currentAmount = currentAmount;
		$('#myModal').modal({show:true})
	}

	$scope.pay = function(amount){
		$('#pay-button').attr('disabled','disabled')
		$('#pay-button').html('Processing...')
		Stripe.card.createToken({
		  number: $scope.number,
		  cvc: $scope.cvc,
		  exp_month: $scope.expiry.substring(0,2),
		  exp_year: $scope.expiry.substring(3,$scope.expiry.length)
		}, function(status, response){
		  if (response.error) {
				$('#pay-button').html('Error...')
		  } else {
		    var token = response.id;
		    var customerStripe = new $stamplay.Stripe();
				customerStripe.charge($scope.user.id, token, parseInt(amount)*100, 'USD').then(function (response) {
					$scope.$apply(function(){
						$scope.backers ++;
						$scope.money += parseInt(amount);
						var updateFund = funds.instance[0];
						updateFund.set('money',$scope.money);
						updateFund.save().then(function(){},function(err){/*manage error*/})
					})
				  $('#myModal').modal('hide')
				}, function(){
					$('#pay-button').html('Error...')
				})
		  }
		});
	}

	var partialDate= $('#data-left').data('expire-date').split("/")  
	var date1 = new Date(parseInt(partialDate[2]), parseInt(partialDate[1])-1, parseInt(partialDate[0]));
	var date2 = new Date()
	var timeDiff = Math.abs(date2.getTime() - date1.getTime());
	$scope.daysLeft  = Math.ceil(timeDiff / (1000 * 60 *60 * 24)); 

	var backers = new $stamplay.Cobject('backer').Collection
	backers.fetch().then(function(){
		$scope.$apply(function(){
			$scope.backers = backers.instance.length;
		})
	}, function(err){
		/*manage error*/
	})

	var funds = new $stamplay.Cobject('fund').Collection;
	funds.limit(1).fetch().then(function(){
		$scope.$apply(function(){
			$scope.money = funds.instance[0].get('money')
		})
	},function(err){
		/*manage error*/
	})

}])