//Main controller
const app = angular.module("fullTable",[]).controller("main", function($scope, $http){
	$scope.testathin = function(){
		console.log($scope.moves)
	}
	//Constants
	$scope.types = ["", "Bug", "Dark", "Dragon", "Electric", "Fairy", "Fighting", "Fire",
					"Flying", "Ghost", "Grass", "Ground", "Ice", "Normal", "Poison",
					"Psychic", "Rock", "Steel", "Water"]

	//Properties
	$scope.sortOrder = "species"
	$scope.reversed = false
	$scope.shiny = false
	$scope.includeHA = true
	$scope.t1 = ""
	$scope.t2 = ""
	$scope.a1 = ""
	$scope.a2 = ""
	$scope.move1 = null
	$scope.move2 = null
	$scope.move3 = null
	$scope.move4 = null

	//Specific Filters
	$scope.g1 = true
	$scope.g2 = true
	$scope.g3 = true
	$scope.g4 = true
	$scope.g5 = true
	$scope.g6 = true
	$scope.g7 = true
	$scope.g8 = true
	$scope.g9 = true
	$scope.mega = true
	$scope.alola = true
	$scope.galar = true
	$scope.hisui = true
	$scope.firstStage = true
	$scope.middleStage = true
	$scope.finalStage = true
	$scope.singleStage = true
	$scope.other = true
	$scope.legendary = true
	$scope.mythical = true
	$scope.pseudo = true
	$scope.baby = true


	//Ranges
	$scope.hpmin = Number.MIN_VALUE
	$scope.hpmax = Number.MAX_VALUE

	$scope.atkmin = Number.MIN_VALUE
	$scope.atkmax = Number.MAX_VALUE

	$scope.defmin = Number.MIN_VALUE
	$scope.defmax = Number.MAX_VALUE

	$scope.spatkmin = Number.MIN_VALUE
	$scope.spatkmax = Number.MAX_VALUE

	$scope.spdefmin = Number.MIN_VALUE
	$scope.spdefmax = Number.MAX_VALUE

	$scope.spdmin = Number.MIN_VALUE
	$scope.spdmax = Number.MAX_VALUE

	$scope.bstmin = Number.MIN_VALUE
	$scope.bstmax = Number.MAX_VALUE

	$scope.weightmin = Number.MIN_VALUE
	$scope.weightmax = Number.MAX_VALUE

	
	//Functions
	$scope.sortBy = function(sortVal){
		$scope.sortOrder=sortVal
		$scope.reversed = !$scope.reversed
	}

	$scope.typefilter = function(input){
		let first=false
		let second=false

		if($scope.t1!=""){
			if(input.type1==$scope.t1 || input.type2==$scope.t1){
				first=true
			}
		}
		else{
			first=true
		}

		if($scope.t2!=""){
			if(input.type1==$scope.t2 || input.type2==$scope.t2){
				second=true
			}
		}
		else{
			second=true
		}

		return first && second
		
	}

	$scope.abilityFilter = function(input){
		return true
	}

	$scope.numerics = function(input){
		const mins = [$scope.hpmin, $scope.atkmin, $scope.defmin, $scope.spatkmin, $scope.spdefmin, $scope.spdmin, $scope.bstmin, $scope.weightmin]
		const maxes = [$scope.hpmax, $scope.atkmax, $scope.defmax, $scope.spatkmax, $scope.spdefmax, $scope.spdmax, $scope.bstmax, $scope.weightmax]
		
		for(var i=0; i<mins.length; i++){
			if(mins[i]==""){
				mins[i]=Number.MIN_VALUE
			}
		}
		for(var i=0; i<maxes.length; i++){
			if(mins[i]==""){
				mins[i]=Number.MAX_VALUE
			}
		}
		if((input.hp>=$scope.hpmin && input.hp<=$scope.hpmax) &&
		   (input.atk>=$scope.atkmin && input.atk<=$scope.atkmax) &&
		   (input.def>=$scope.defmin && input.def<=$scope.defmax) &&
		   (input.spatk>=$scope.spatkmin && input.spatk<=$scope.spatkmax) &&
		   (input.spdef>=$scope.spdefmin && input.spdef<=$scope.spdefmax) &&
		   (input.speed>=$scope.spdmin && input.speed<=$scope.spdmax) &&
		   (input.bst>=$scope.bstmin && input.bst<=$scope.bstmax) &&
		   (input.weight/10>=$scope.weightmin && input.weight/10<=$scope.weightmax)
			){
			return true
		}
		else{
			return false
		}
	}

	$scope.otherFilters = function(input){
		//Gens
		const allgens = [$scope.g1, $scope.g2, $scope.g3, $scope.g4, $scope.g5, 
		 				 $scope.g6, $scope.g7, $scope.g8, $scope.g9]
		for(var i=0; i<allgens.length; i++){
			if(allgens[i]==false && input.generation==i+1){
				return false
			}
		}

		//Stages
		const stages = [$scope.singleStage, $scope.firstStage, $scope.middleStage, $scope.finalStage]
		for(var i=0; i<stages.length; i++){
			if(stages[i]==false && input.evolution_stage==i){
				return false
			}
		}

		//Forms
		if($scope.mega==false && input.mega>0){
			return false
		}
		if($scope.alola==false && input.regional==1){
			return false
		}
		if($scope.galar==false && input.regional==2){
			return false
		}
		if($scope.hisui==false && input.regional==3){
			return false
		}
		if($scope.other==false && input.form==1){
			return false
		}

		//Class
		if($scope.legendary==false && (input.legendary==1 || input.mythical==1)){
			return false
		}
		if($scope.mythical==false && input.mythical==1){
			return false
		}
		if($scope.pseudo==false && input.pseudo==1){
			return false
		}
		if($scope.baby==false && input.baby==1){
			return false
		}

		return true
	}

	$scope.moveFilter = function(input){
		function binarySearch(arr, target, start, end){
			if(start>end){
				return false
			}

			const middle = Math.floor((start+end)/2)
			if(arr[middle].id==target){
				return true
			}
			if(target>arr[middle].id){
				return(binarySearch(arr, target, middle+1, end))
			}
			else{
				return(binarySearch(arr, target, start, middle-1))
			}
		}

		const moveset = [$scope.move1, $scope.move2, $scope.move3, $scope.move4]
		let pass = true
		for(var i=0; i<moveset.length; i++){
			if(moveset[i]==null){
				continue
			}
			pass = pass && binarySearch(input.movepool, moveset[i].id, 0, input.movepool.length-1)
		}

		return pass		
	}


	//Main

	//Populate move data
	$http.get(`http://localhost:5000/pokemon`).then(res=>{
		$scope.rows = res.data
	}).then(()=>{
		$http.get(`http://localhost:5000/movepools`).then(res=>{
			const ocean = res.data
			let pool = new Array(621).fill(0)
			let prev = -1
			let count = 0

			for(var i=0; i<ocean.length; i++){
				if(prev>ocean[i].id){
					$scope.rows[count].movepool = pool
					pool = new Array(621).fill(0)
					count++
				}
				
				pool[ocean[i].id-1] = 1
				prev = ocean[i].id				
			}
		})
	})
		
	$http.get(`http://localhost:5000/moves`).then(function(res){
		$scope.moves = res.data	
	})	

	
})

//Custom Filter Functions
