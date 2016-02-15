import React, {AppRegistry, PanResponder, Dimensions, StyleSheet, View} from 'react-native'
import {Surface, Group, Shape, Path} from 'ReactNativeART'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  }
})

const {width, height} = Dimensions.get('window')

let lastPoint = {x: undefined, y: undefined, timestamp: undefined}
let pollId

const setLastPoint = ({pageX, pageY, timestamp}, dateTime) => {
  lastPoint = {x: pageX, y: pageY, timestamp, date: dateTime}
}

const getAlpha = (i, numberOfPoints) => {
  const threshold = (numberOfPoints / (numberOfPoints * (numberOfPoints - i)))

  return threshold < 0.09 ? 0 : 1
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

const Snake = React.createClass({
  getInitialState: function() {
    return {
      points: [[]]
    }
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
  grant: function({nativeEvent}, {x0, y0}) {
    setLastPoint(nativeEvent, Date.now())
    this.setState(state => ({points: state.points.concat([[]])}))
    this.setNewPoint()
    this.poll()
  },
  poll: function() {
    pollId = setTimeout(() => {
      this.setNewPoint()
      this.poll()
    }, 8)
  },
  setNewPoint: function () {
    this.setState(state => {
      var lineToUpdate = state.points.pop()
      var newLine = lineToUpdate.concat({
        x: lastPoint.x,
        y: lastPoint.y,
        timestamp: lastPoint.timestamp
      })
      var points = state.points.concat([newLine])
      return {points}
    })
  },
  move: function ({nativeEvent}) {
    setLastPoint(nativeEvent, Date.now())
  },
  release: function ({nativeEvent}) {
    clearTimeout(pollId)
    setLastPoint(nativeEvent, Date.now())
    this.setNewPoint()
  },
  render: function() {
    // const lastLine = this.state.points[this.state.points.length - 1]
    // const smoothLine = getSmoothLine(lastLine)
    const smoothLines = this.state.points.map(line => getSmoothLine(line))

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
                        opacity={getAlpha(i, array.length)}
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
