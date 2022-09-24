/** @format */

import useBaseUrl from "@docusaurus/useBaseUrl"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import Layout from "@theme/Layout"
import clsx from "clsx"
import React from "react"
import styles from "./styles.module.css"
import { Button, TextField } from "@mui/material"
import {JSONEditor} from '@json-editor/json-editor'
import { useEffect } from 'react'
import schema from './schema.json'
import config from './template_config.json'

const features = [
	{
		title: "Easy to Use",
		imageUrl: "img/undraw_docusaurus_mountain.svg",
		description: (
			<>
				Configure you smartcloud actions using JSON or YAML declaritively. Either use the documentation or our config generator tool to get started.
			</>
		)
	},
	{
		title: "Focus on What Matters",
		imageUrl: "img/undraw_docusaurus_tree.svg",
		description: (
			<>
				Configure you tools to do as little or as much as you need. Smartcloud is designed to be flexible and work with your existing tools.
			</>
		)
	},
	{
		title: "Powered by Github Actions",
		imageUrl: "img/undraw_docusaurus_react.svg",
		description: (
			<>
				Smartcloud has been designed to work within you github actions. No need to implement complex third party integrations, just use what you already have.
			</>
		)
	}
]

function Feature({ imageUrl, title, description }) {
	const imgUrl = useBaseUrl(imageUrl)
	return (
		<div className={clsx("col col--4", styles.feature)}>
			{imgUrl && (
				<div className="text--center">
					<img className={styles.featureImage} src={imgUrl} alt={title} />
				</div>
			)}
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	)
}

function Configurator() {
		useEffect(() => {
			const element = document.getElementById('editor_holder');
			const editor = new JSONEditor(element, {
				schema: schema,
				startval: config,
				theme: 'spectre'
			})
			
		}, [])
	return <div id='editor_holder'/>
}

export default function Home() {
	const context = useDocusaurusContext()
	const [isConfigOpen, setisConfigOpen] = React.useState(false)


	if (!isConfigOpen) return (
		<Layout
			title={`The supercharged Github Action`}
			description="The most advanced github action, with functionality overflowing and declaritive configuration to streamline your entire github workflow!"
		>
			<div className={styles.hero}>
				<main>
					{features && features.length > 0 && (
						<section className={styles.section}>
							<div className={styles.features}>
								{features.map((props, idx) => (
									<Feature key={idx} {...props} />
								))}
							</div>
						</section>
					)}
				</main>
				<Button variant="outlined" onClick={() => setisConfigOpen(true)}>Open Configurator</Button>
			</div>
		</Layout>
	)
	else {		
		return (
			<Layout
				title={`The supercharged Github Action`}
				description="The most advanced github action, with functionality overflowing and declaritive configuration to streamline your entire github workflow!"
			>
				<Button variant="outlined" onClick={() => setisConfigOpen(false)}>Close Configurator</Button>
				<Configurator/>
		</Layout>
		)
	}
}
