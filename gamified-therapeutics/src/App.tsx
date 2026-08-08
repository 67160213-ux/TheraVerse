import { Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell'
import RequireStep from './components/RequireStep'
import { useApp } from './context/AppContext'

import Landing from './pages/Landing'
import DeviceSetup from './pages/DeviceSetup'
import BluetoothConnect from './pages/BluetoothConnect'
import PreRunLobby from './pages/PreRunLobby'
import RunTracker from './pages/RunTracker'
import BattleLobby from './pages/BattleLobby'
import ActiveBattle from './pages/ActiveBattle'
import BattleResult from './pages/BattleResult'
import ClinicalDashboard from './pages/ClinicalDashboard'
import Rewards from './pages/Rewards'

export default function App() {
  const { consentGiven, devices, game } = useApp()
  const bothConnected = devices.watchConnected && devices.cgmConnected
  const goalReached = game.distanceM >= 2000

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/device-setup"
          element={
            <RequireStep ok={consentGiven} redirectTo="/">
              <DeviceSetup />
            </RequireStep>
          }
        />
        <Route
          path="/connect"
          element={
            <RequireStep ok={consentGiven} redirectTo="/">
              <BluetoothConnect />
            </RequireStep>
          }
        />
        <Route
          path="/pre-run"
          element={
            <RequireStep ok={bothConnected} redirectTo="/connect">
              <PreRunLobby />
            </RequireStep>
          }
        />
        <Route
          path="/run"
          element={
            <RequireStep ok={bothConnected} redirectTo="/connect">
              <RunTracker />
            </RequireStep>
          }
        />
        <Route
          path="/battle"
          element={
            <RequireStep ok={goalReached} redirectTo="/run">
              <BattleLobby />
            </RequireStep>
          }
        />
        <Route
          path="/battle/active"
          element={
            <RequireStep ok={goalReached} redirectTo="/run">
              <ActiveBattle />
            </RequireStep>
          }
        />
        <Route
          path="/battle/result"
          element={
            <RequireStep ok={!!game.lastBossResult} redirectTo="/run">
              <BattleResult />
            </RequireStep>
          }
        />
        <Route path="/dashboard" element={<ClinicalDashboard />} />
        <Route path="/rewards" element={<Rewards />} />
      </Routes>
    </AppShell>
  )
}
