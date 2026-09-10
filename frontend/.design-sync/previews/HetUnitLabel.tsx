import HetUnitLabel from '../../src/styles/HetComponents/HetUnitLabel'

export const Default = () => (
  <p className="m-0">
    32.4 <HetUnitLabel>per 100k</HetUnitLabel>
  </p>
)

export const Percent = () => (
  <p className="m-0">
    18.7 <HetUnitLabel>%</HetUnitLabel>
  </p>
)

export const CustomClass = () => (
  <p className="m-0">
    4,210 <HetUnitLabel className="text-alt-green">cases reported</HetUnitLabel>
  </p>
)
