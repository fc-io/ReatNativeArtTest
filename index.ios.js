import React, {PanResponder, Dimensions, AppRegistry, StyleSheet, Animated, View} from 'react-native'
import ReactNativeART, {Surface, Shape, Path, Group, Transform} from 'ReactNativeART'
var {width, height} = Dimensions.get('window');

var AnimatedShape = Animated.createAnimatedComponent(Shape);
var AnimatedGroup = Animated.createAnimatedComponent(Group);

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  }
});


var latestPoint = {x: undefined, y: undefined}
var isPressing = false
var pollTime = 0
var pollId

var FireworkShooter = React.createClass({
  getInitialState: function() {
    return {
      points: [[]]
    };
  },
  componentWillMount: function () {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: this.grant,
      onPanResponderMove: this.move,
      onPanResponderRelease: this.release,
      // onPanResponderTerminate: this._handlePanResponderEnd
    })
  },
  grant: function(e, {x0, y0}) {
    isPressing = true
    latestPoint = {x: x0, y: y0}
    pollTime = 0
    this.setState(state => ({
      points: state.points.concat([[]])
    }))
    this.poll()
  },
  poll: function() {
    pollId = setTimeout(() => {
      this.setState(state => {
        var lineToUpdate = state.points.pop()
        var newLine = lineToUpdate.concat({x: latestPoint.x, y: latestPoint.y})
        console.log('newLine')
        if (pollTime % (16 * 2) === 0) {
          console.log('pollTime')
          newLine.shift()
        }
        var points = state.points.concat([newLine])

        pollTime += 16

        return {
          points
        }
      })
      this.poll()
    }, 16)
  },
  move: function ({nativeEvent}) {
    latestPoint = {x: nativeEvent.pageX, y: nativeEvent.pageY}
  },
  release: function() {
    isPressing = false
    clearTimeout(pollId)
  },

  // _handleAddFirework: function(e) {
  //     var _shootingPosition = new Animated.ValueXY({x: width/2, y: height - MORTAR_RADIUS});
  //     this.state.fireworks.push({
  //       shootingPosition: _shootingPosition,
  //     });
  //     Animated.timing(_shootingPosition, {
  //         duration: 300,
  //         toValue: {
  //           y: e.nativeEvent.locationY,
  //           x: e.nativeEvent.locationX
  //         }
  //     }).start()
  //
  //     this.setState(this.state);
  // },
  render: function() {
    return (
      <View style={styles.container} {...this.panResponder.panHandlers}>
          <Surface width={width} height={height}>
            {this.state.points.map((line, i) => <AnimatedCircle key={i} points={line} stroke="#000" />)}
          </Surface>
      </View>
    );
  }
});

var AnimatedCircle = React.createClass({
  render: function() {
    var radius = 5;
    var lastLine = this.props.points
    // var lastLine = this.props.points[this.props.points.length - 1]
    var firstPoint = lastLine[0] || {x: 0, y: 0}
    // var lastPoint = lastLine[lastLine.length - 1] || {x: 0, y: 0}
    // console.log(this.props.points.length)
    // console.log(JSON.stringify(this.props.points))
    // console.log(`firstPoint {:x ${firstPoint.x} :y ${firstPoint.y}`)
    // console.log(`lastPoint {:x ${lastPoint.x} :y ${lastPoint.y}}`)
    var path = Path().moveTo(firstPoint.x, firstPoint.y)
    // console.log('lines', this.props.points.length)


    lastLine.forEach(point=>{
      path.lineTo(point.x, point.y)
    })
    // path.stroke('#f000')

    return React.createElement(AnimatedShape, React.__spread({},  this.props, {d: path}));
  }
});

AppRegistry.registerComponent('native_canvas', () => FireworkShooter);
