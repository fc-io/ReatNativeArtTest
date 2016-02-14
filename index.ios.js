import _ from 'lodash'
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
      onPanResponderTerminate: this.release
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
  getAlpha: function (i, numberOfPoints) {
    const alpha =  (numberOfPoints / (numberOfPoints * (numberOfPoints - i)))

    return alpha < 0.1 ? 0 : alpha
  },
  render: function() {
    var line = this.state.points[this.state.points.length - 1]
    var smoothLine = line.reduce((acc, cV, i, line) => {
      const previousPoint2 = line[i]
      const previousPoint1 = line[i + 1]
      const currentPoint = line[i + 2]

      if (!currentPoint) {
        return acc
      }

      const mid1 = getMidPoint(previousPoint1, previousPoint2)
      const mid2 = getMidPoint(currentPoint, previousPoint1)

      return acc.concat({
        previousPoint1,
        mid1,
        mid2
      })
    }, [])

    return (
      <View style={styles.container} {...this.panResponder.panHandlers}>
        <Surface width={width} height={height}>
          {
            line.map((lastLine, i, array) =>
              <AnimatedCircle
                key={i}
                i={i}
                line={array}
                strokeCap="butt"
                strokeJoin="miter"
                opacity={this.getAlpha(i, array.length)}
                stroke="#000"
                strokeWidth={4}
              />)
          }
        </Surface>
      </View>
    );
  }
});

var getMidPoint = (p1, p2) => {
    return {
      x: (p1.x + p2.x) * 0.5,
      y: (p1.y + p2.y) * 0.5
    }
}

var AnimatedCircle = React.createClass({
  render: function() {
    var firstPoint = this.props.line[this.props.i] || {x: 0, y: 0}
    var lineToPoint = this.props.line[this.props.i + 1] || this.props.line[this.props.i] || {x: 0, y: 0}
    var path = Path().moveTo(firstPoint.x, firstPoint.y).lineTo(lineToPoint.x, lineToPoint.y)

    return React.createElement(AnimatedShape, React.__spread({},  this.props, {d: path}));
  }
});

AppRegistry.registerComponent('native_canvas', () => FireworkShooter);
