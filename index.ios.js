import React, {AppRegistry, PanResponder, Dimensions, StyleSheet, View} from 'react-native'
import {Surface, Group, Shape, Path} from 'ReactNativeART'
import TimerMixin from 'react-timer-mixin'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  }
})

const {width, height} = Dimensions.get('window')

let lastPoint = {x: undefined, y: undefined, timestamp: undefined}

const getAlpha = (i, points, time) => {
  const pointTime = points[i].previousPoint1.time
  const timeThreshold =  time > pointTime + 160
  return timeThreshold ? 0 : 1
}

const getMidPoint = (p1, p2) => (
  {x: (p1.x + p2.x) * 0.5, y: (p1.y + p2.y) * 0.5}
)

const getSmoothLine = line => (
  line.reduce((acc, cV, i, line) => {
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
)

const getLineSegmentPath = ({previousPoint1, mid1, mid2}) => (
  Path().moveTo(mid1.x, mid1.y).curveTo(previousPoint1.x, previousPoint1.y, mid2.x, mid2.y)
)

let isPressing = false
let isTracking = false
let points = []

const setLatestPoint = ({pageX, pageY, timestamp}) => {
  lastPoint = {x: pageX, y: pageY, timestamp}
}

const setNewPoint = function (time) {
  var lineToUpdate = points.pop()
  var newLine = lineToUpdate.concat({
    x: lastPoint.x,
    y: lastPoint.y,
    time
  })
  points = points.concat([newLine])
}

const Snake = React.createClass({
  mixins: [TimerMixin],
  tick: function () {
    this.requestAnimationFrame((time) => {
      if (isPressing && !isTracking) {
        points = points.concat([[]])
        isTracking = true
      }

      if (isTracking) {
        setNewPoint(time)
      }

      if (!isPressing && isTracking) {
        isTracking = false
      }

      this.setState({time})
      this.tick()
    })
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
    this.tick()
  },
  grant: function({nativeEvent}) {
    isPressing = true
    setLatestPoint(nativeEvent)
  },
  move: function ({nativeEvent}) {
    setLatestPoint(nativeEvent)
  },
  release: function ({nativeEvent}) {
    setLatestPoint(nativeEvent)
    isPressing = false
  },
  render: function() {
    const smoothLines = points.map(line => getSmoothLine(line))
    const time = this.state && this.state.time

    return (
      <View style={styles.container} {...this.panResponder.panHandlers}>
        <Surface width={width} height={height}>
          {
            smoothLines.map((line, lineIndex) => {
              return (
                <Group key={lineIndex}>
                  {
                    line.map((points, i, array) =>
                      <Shape
                        key={lineIndex + ':' + i}
                        d={getLineSegmentPath(points)}
                        opacity={getAlpha(i, array, time)}
                        stroke="#000"
                        strokeWidth={4}
                      />
                    )
                  }
                </Group>
              )
            })
          }
        </Surface>
      </View>
    )
  }
})

AppRegistry.registerComponent('native_canvas', () => Snake)
