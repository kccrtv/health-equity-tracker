import { dataSourceMetadataMap } from '../../data/config/MetadataMap'
import { DataTypeConfig, METRIC_CONFIG } from '../../data/config/MetricConfig'
import { MetricQueryResponse } from '../../data/query/MetricQuery'
import { Row } from '../../data/utils/DatasetTypes'
import {
  getSubPopulationPhrase,
  getTotalACSPopulationPhrase,
} from './GeoContext'
import { describe, test, expect } from 'vitest'

describe('test getTotalACSPopulationPhrase()', () => {
  const nationalACSPopData: Row[] = [
    {
      population: 328016242,
      fips: '00',
      fips_name: 'United States',
    },
  ]

  test('normal ACS population', () => {
    const normalPopPhrase = getTotalACSPopulationPhrase(
      /* data */ nationalACSPopData
    )
    expect(normalPopPhrase).toEqual('Total population: 328,016,242 (from ACS 2022)')
  })
})

describe('test getSubPopulationPhrase()', () => {
  const nationalPhrmaData: Row[] = [
    {
      statins_beneficiaries_estimated_total: 41816007,
      race_and_ethnicity: 'All',
      fips: '00',
      fips_name: 'United States',
    },
    {
      statins_beneficiaries_estimated_total: 216860,
      race_and_ethnicity: 'Indigenous (NH)',
      fips: '00',
      fips_name: 'United States',
    },
    {
      statins_beneficiaries_estimated_total: 1209171,
      race_and_ethnicity: 'Asian, Native Hawaiian, and Pacific Islander (NH)',
      fips: '00',
      fips_name: 'United States',
    },
    {
      statins_beneficiaries_estimated_total: 4330893,
      race_and_ethnicity: 'Black or African American (NH)',
      fips: '00',
      fips_name: 'United States',
    },
    {
      statins_beneficiaries_estimated_total: 2987102,
      race_and_ethnicity: 'Hispanic or Latino',
      fips: '00',
      fips_name: 'United States',
    },
    {
      statins_beneficiaries_estimated_total: 332663,
      race_and_ethnicity: 'Two or more races & Unrepresented race (NH)',
      fips: '00',
      fips_name: 'United States',
    },
    {
      statins_beneficiaries_estimated_total: 32003930,
      race_and_ethnicity: 'White (NH)',
      fips: '00',
      fips_name: 'United States',
    },
  ]
  const statinsAdherenceConfig: DataTypeConfig =
    METRIC_CONFIG.medicare_cardiovascular[1]

  test('phrma medicare national population', () => {

    const medicarePopPhrase = getSubPopulationPhrase(
      /* data */ nationalPhrmaData,
      /* subPopulationSourceLabel */ dataSourceMetadataMap.phrma.data_source_acronym,
      /* demographicType */ 'race_and_ethnicity',
      /* dataTypeConfig */ statinsAdherenceConfig
    )
    expect(medicarePopPhrase).toEqual('Total population of Medicare Statins Beneficiaries, Ages 18+: 41,816,007 (from CMS)')
  })

  const countyPhrmaData: Row[] = [
    {
      medicare_population: null,
      some_metric_: 50.0,
      sex: 'All',
      fips: '99999',
      fips_name: 'Some County',
    },
    {
      medicare_population: null,
      some_metric_: 50.0,
      sex: 'Male',
      fips: '99999',
      fips_name: 'Some County',
    },
    {
      medicare_population: null,
      some_metric_: 50.0,
      sex: 'Female',
      fips: '99999',
      fips_name: 'Some County',
    },
  ]

  test('phrma medicare metric expects extra subpop breadcrumb, but pop data is unavailable', () => {
    const medicarePopPhrase = getSubPopulationPhrase(
      /* data */ countyPhrmaData,
      /* subPopulationSourceLabel */ dataSourceMetadataMap.phrma.data_source_acronym,
      /* demographicType */ 'sex',
      /* dataTypeConfig */ statinsAdherenceConfig
    )
    expect(medicarePopPhrase).toEqual('Total population of Medicare Statins Beneficiaries, Ages 18+: unavailable (from CMS)')
  })

  const nationalCovidData: Row[] = [
    {
      covid_estimated_total: 41816007,
      race_and_ethnicity: 'All',
      fips: '00',
      fips_name: 'United States',
    },
    {
      covid_estimated_total: 216860,
      race_and_ethnicity: 'Indigenous (NH)',
      fips: '00',
      fips_name: 'United States',
    },
    {
      covid_estimated_total: 1209171,
      race_and_ethnicity: 'Asian, Native Hawaiian, and Pacific Islander (NH)',
      fips: '00',
      fips_name: 'United States',
    },
    {
      covid_estimated_total: 4330893,
      race_and_ethnicity: 'Black or African American (NH)',
      fips: '00',
      fips_name: 'United States',
    },
    {
      covid_estimated_total: 2987102,
      race_and_ethnicity: 'Hispanic or Latino',
      fips: '00',
      fips_name: 'United States',
    },
    {
      covid_estimated_total: 332663,
      race_and_ethnicity: 'Two or more races & Unrepresented race (NH)',
      fips: '00',
      fips_name: 'United States',
    },
    {
      covid_estimated_total: 32003930,
      race_and_ethnicity: 'White (NH)',
      fips: '00',
      fips_name: 'United States',
    },
  ]

  const covidCasesConfig: DataTypeConfig = METRIC_CONFIG.covid[0]

  test('covid should not get a subpopulation', () => {
    const emptyCovidSubPopPhrase = getSubPopulationPhrase(
      /* data */ nationalCovidData,
      /* subPopulationSourceLabel */ dataSourceMetadataMap.cdc_restricted.data_source_acronym,
      /* demographicType */ 'race_and_ethnicity',
      /* dataTypeConfig */ covidCasesConfig
    )
    expect(emptyCovidSubPopPhrase).toEqual('')
  })
})
