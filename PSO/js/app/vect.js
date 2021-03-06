define(['underscore', 'util'], function(_, Util) {
    var vect = {};

    // Utility function sums all of its arguments
    var sum = function() {
        var list = _.toArray(arguments);
        return _.reduce(list, function(sum, current) {
            return sum + current;
        }, 0);
    };

    vect.create = function() {
        return _.toArray(arguments);
    };

    // Create a vector with `dim` components, lying in the ball with the
    // given center and radius (both optional). Uses the Box-Muller
    // transform.
    vect.randomInSphere = function(dim, center, radius) {
        // get a collection of normal random variables
        var ret = _.map(_.range(dim), Util.getNormalRand);
        // normalize - now it is in the unit sphere
        ret = vect.normalize(ret, Math.pow(Math.random(), 1 / dim));
        // rescale
        if (radius) { ret = vect.scale(radius, ret); }
        // translate
        if (center) { ret = vect.add(ret, center); }
        return ret;
    };

    // A higher-order function which takes in a function whose arguments
    // are numbers. It returns a function which does the same thing as
    // `fun`, but whose arguments are vectors.
    vect.vectorize = function(fun) {
        return function() {
            var args = _.toArray(arguments);
            if (Util.existy(args[0].length)) {
                return _.map(_.range(args[0].length), function(index) {
                    return fun.apply(null, _.map(args, function(ary) {
                        return ary[index];
                    }));
                });
            }
        };
    };

    // A higher order function. Takes as arguments any number of
    // coefficients and returns a function of the same number of
    // vectors, returning the given linear combination.
    vect.lcom = function() {
        var coeffs = _.toArray(arguments);
        return vect.vectorize(function() {
            var inputs = _.toArray(arguments);
            return sum.apply(null, _.map(_.zip(coeffs, inputs), function(pair) {
                return pair[0] * pair[1]; // coeff * input
            }));
        });
    };
        
    // Takes as argument a 2-dimensional array and returns a matrix,
    // which is a function that can be applied to vectors to get new
    // vectors.
    vect.matrix = function(m) {
        return function(v) {
            return vect.lcom.apply(null, v).apply(null, m);
        };
    };

    vect.add = vect.vectorize(sum);

    vect.subtract = vect.vectorize(function(v, w) {
        return v - w;
    });

    // Scale vector by factor a
    vect.scale = function(a, v) {
        return vect.vectorize(function(v) { return a * v; })(v);
    };

    // Return magnitude
    vect.magnitude = function(v) {
        return Math.sqrt(_.reduce(v, function(sum, x) { return sum + x*x; }, 0));
    };

    // Return a vector in the same direction as v, but with magnitude
    // mag
    vect.normalize = function(v, mag) {
        mag = mag || 1;
        return vect.scale(mag / vect.magnitude(v), v);
    };

    return vect;
});

