import HetDivider from '../../src/styles/HetComponents/HetDivider'

export const Default = () => (
  <div style={{ width: 480 }}>
    <p className="m-0 mb-4">Explore health equity data by state, county, and demographic group.</p>
    <HetDivider />
    <p className="m-0 mt-4">See how outcomes vary across race, ethnicity, and income.</p>
  </div>
)

export const WideSection = () => (
  <div style={{ width: 480 }}>
    <p className="m-0 mb-4">Data sources: CDC, ACS, BRFSS</p>
    <HetDivider className="w-full my-2" />
    <p className="m-0 mt-4">Last updated September 2026</p>
  </div>
)
