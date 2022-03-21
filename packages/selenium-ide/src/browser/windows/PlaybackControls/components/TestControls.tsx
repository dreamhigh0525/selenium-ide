import Tooltip from '@mui/material/Tooltip'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay'
import PauseIcon from '@mui/icons-material/Pause'
import StopIcon from '@mui/icons-material/Stop'
import RecordIcon from '@mui/icons-material/FiberManualRecord'
import { StateShape } from 'api/types'
import React, { FC } from 'react'
import badIndex from 'api/constants/badIndex'

export interface TestControlsProps {
  state: StateShape
}

const activeStates = ['recording', 'playing']

const TestControls: FC<TestControlsProps> = ({ state }) => (
  <>
    {activeStates.includes(state.status) ? (
      <>
        <Tooltip title="Pause" aria-label="pause">
          <PauseIcon
            className="button m-2"
            onClick={() => window.sideAPI.playback.pause()}
          />
        </Tooltip>
        <Tooltip title="Stop" aria-label="stop">
          <StopIcon
            className="button m-2"
            onClick={() => window.sideAPI.playback.stop()}
          />
        </Tooltip>
      </>
    ) : (
      <>
        <Tooltip title="Play" aria-label="play">
          <PlayArrowIcon
            className="button m-2"
            onClick={() => {
              state.playback.currentIndex === badIndex
                ? window.sideAPI.playback.play(state.activeTestID)
                : window.sideAPI.playback.resume()
            }}
          />
        </Tooltip>
        <Tooltip title="Play Suite" aria-label="play-suite">
          <PlaylistPlayIcon
            className="button m-2"
            onClick={() => window.sideAPI.playback.play(state.activeTestID)}
          />
        </Tooltip>
        <Tooltip title="Record" aria-label="record">
          <RecordIcon
            className="button m-2"
            color="error"
            onClick={() => window.sideAPI.recorder.start()}
          />
        </Tooltip>
      </>
    )}
  </>
)

export default TestControls
