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

        if (pollTime % (8 * 2) === 0) {
          newLine.shift()
        }
        var points = state.points.concat([newLine])

        pollTime += 8

        return {
          points
        }
      })
      this.poll()
    }, 8)
  },
  move: function ({nativeEvent}) {
    latestPoint = {x: nativeEvent.pageX, y: nativeEvent.pageY}
  },
  release: function() {
    isPressing = false
    clearTimeout(pollId)
  },
  getAlpha: function (i, numberOfPoints) {
    const threshold =  (numberOfPoints / (numberOfPoints * (numberOfPoints - i)))

    return threshold < 0.09 ? 0 : 1
  },
  render: function() {
    var lastLine = this.state.points[this.state.points.length - 1]
    var smoothLine = getSmoothLine(lastLine)

    return (
      <View style={styles.container} {...this.panResponder.panHandlers}>
        <Surface width={width} height={height}>
          {
            smoothLine.map((points, i, array) =>
              <Shape
                key={i}
                d={getLineSegmentPath(points)}
                points={points}
                strokeCap="round"
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

var getMidPoint = (p1, p2) => ({
  x: (p1.x + p2.x) * 0.5,
  y: (p1.y + p2.y) * 0.5
})

var getSmoothLine = line => line.reduce((acc, cV, i, line) => {
  const previousPoint2 = line[i]
  const previousPoint1 = line[i + 1]
  const currentPoint = line[i + 2]

  if (!currentPoint) {
    return acc
  }

  const mid1 = getMidPoint(previousPoint1, previousPoint2)
  const mid2 = getMidPoint(currentPoint, previousPoint1)

  return acc.concat({previousPoint1, mid1, mid2})
}, [])

var getLineSegmentPath = ({previousPoint1, mid1, mid2}) =>
  Path().moveTo(mid1.x, mid1.y).curveTo(previousPoint1.x, previousPoint1.y, mid2.x, mid2.y)

AppRegistry.registerComponent('native_canvas', () => FireworkShooter);
