import { Helmet } from 'react-helmet-async'
import { Route, Switch, useLocation, useRouteMatch } from 'react-router-dom'
import { routeConfigs } from '../policyContent/routeConfigs'
import HetOnThisPageMenu from '../../../styles/HetComponents/HetOnThisPageMenu'
import HetCardMenu from '../../../styles/HetComponents/HetCardMenu'
import HetCardMenuMobile from '../../../styles/HetComponents/HetCardMenuMobile'
import PolicyPagination from './PolicyPagination'

export default function PolicyPage() {
	const location = useLocation()

	const activeRoute = routeConfigs.find(
		(route) => route.path === location.pathname,
	)

	return (
		<>
			<Helmet>
				<title>Policy Context - Health Equity Tracker</title>
			</Helmet>
			<section
				className='flex w-full justify-center text-left max-w-screen'
				id='main'
			>
				<div className='smMd:m-[2%] max-w-lgXl flex flex-col grow smMd:flex-row'>
					<h2 className='sr-only'>Gun Violence Policy Context Page</h2>

					<div className='min-w-fit w-fit max-w-screen'>
						<HetCardMenu className='sticky top-24 z-top hidden h-min max-w-menu smMd:block' />
						<HetCardMenuMobile className='p-3 smMd:hidden max-w-screen min-w-full w-screen mx-auto my-0 px-4 flex justify-center' />
					</div>
					<div className='flex grow smMd:flex-col xs:block'>
						{/* ON THIS PAGE SUB-MENU - MOBILE/TABLET */}
						<div className='md:hidden px-8'>
							{routeConfigs.map((routeConfig) => {
								const match = useRouteMatch({
									path: routeConfig.path,
									exact: true,
								})
								const hasSublinks =
									routeConfig.subLinks && routeConfig.subLinks.length > 0
								return match && hasSublinks ? (
									<div className='mt-2 mb-12' key={routeConfig.path}>
										<p className='my-0 text-left font-roboto text-smallest font-semibold uppercase text-black'>
											On this page
										</p>
										<HetOnThisPageMenu
											links={routeConfig.subLinks}
											className='w-full'
										/>
									</div>
								) : null
							})}
						</div>

							<h1 className='sr-only'>{activeRoute?.label}</h1>
							<h1 className='md:hidden font-sansTitle text-bigHeader font-bold mt-0 mb-2 px-4 leading-[1]'>
								{activeRoute?.label}
							</h1>
						<section className='flex flex-col justify-end grow mx-8 lg:mx-12 my-0'>
							<Switch>
								<>
									{/* TEXT */}
									{routeConfigs.map((route) => (
										<Route
											key={route.path}
											exact
											path={route.path}
											component={route.component}
										/>
									))}
									{/* PREV / NEXT */}
									<PolicyPagination />
								</>
							</Switch>
						</section>
					</div>
					{/* ON THIS PAGE SUB-MENU - DESKTOP */}
					<div className='hidden min-w-fit md:block'>
						{routeConfigs.map((routeConfig) => {
							const match = useRouteMatch({
								path: routeConfig.path,
								exact: true,
							})
							const hasSublinks =
								routeConfig.subLinks && routeConfig.subLinks.length > 0
							return match && hasSublinks ? (
								<div
									className='min-w-40 w-48 max-w-40 sticky top-24 z-top hidden h-min max-w-menu smMd:block flex flex-col'
									key={routeConfig.path}
								>
									<p className='my-0 text-left font-roboto text-smallest font-semibold uppercase text-black'>
										On this page
									</p>
									<h4 className='mt-2 mb-4 font-sansTitle text-smallestHeader leading-lhNormal'>
										{routeConfig.label}
									</h4>

									<HetOnThisPageMenu
										links={routeConfig.subLinks}
										className='sticky right-0 top-24 z-top h-min'
									/>
								</div>
							) : null
						})}
					</div>
				</div>
			</section>
		</>
	)
}