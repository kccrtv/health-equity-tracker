import HetHighlightSpan from '../../src/styles/HetComponents/HetHighlightSpan'

export const Default = () => (
  <p className='max-w-md font-sans-text text-alt-black text-small'>
    From 2018 to 2021, the rate of{' '}
    <HetHighlightSpan>
      gun deaths among Black youth increased by approximately 75.44% in
      Georgia
    </HetHighlightSpan>
    , while nationally, the rate doubled from 6.0 to 12 per 100k.
  </p>
)

export const ShortPhrase = () => (
  <p className='max-w-md font-sans-text text-alt-black text-small'>
    As of 2022, Black Non-Hispanic youth accounted for{' '}
    <HetHighlightSpan>
      68.0% of gun fatalities while making up only 31.1% of the population
    </HetHighlightSpan>
    .
  </p>
)
