import HetLazyLoader from '../../src/styles/HetComponents/HetLazyLoader'

export const Default = () => (
  <HetLazyLoader>
    <div style={{ width: 480, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
      <h3 style={{ margin: '0 0 8px' }}>Diabetes prevalence by county</h3>
      <p style={{ margin: 0 }}>
        This chart loads once it scrolls into view, keeping the initial page
        load fast for long reports.
      </p>
    </div>
  </HetLazyLoader>
)

export const WithFixedHeight = () => (
  <HetLazyLoader height={220} className="w-full">
    <div style={{ width: 480, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
      <h3 style={{ margin: '0 0 8px' }}>COVID-19 vaccination rates</h3>
      <p style={{ margin: 0 }}>
        A fixed minimum height reserves space before the visualization mounts,
        preventing layout shift.
      </p>
    </div>
  </HetLazyLoader>
)
