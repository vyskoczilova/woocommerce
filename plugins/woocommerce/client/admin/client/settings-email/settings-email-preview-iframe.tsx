/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from 'react';
import { debounce } from 'lodash';

type EmailPreviewIframeProps = {
	src: string;
	setIsLoading: ( isLoading: boolean ) => void;
	settingsIds: string[];
};

export const EmailPreviewIframe: React.FC< EmailPreviewIframeProps > = ( {
	src,
	setIsLoading,
	settingsIds,
} ) => {
	const [ counter, setCounter ] = useState( 0 );

	useEffect( () => {
		const handleFieldChange = async ( event: Event ) => {
			const target = event.target as HTMLInputElement;
			const key = target.id;
			const value = target.value;

			setIsLoading( true );

			try {
				await apiFetch( {
					path: 'wc-admin-email/settings/email/save-transient',
					method: 'POST',
					data: { key, value },
				} );
			} finally {
				setCounter( ( prevCounter ) => prevCounter + 1 );
			}
		};

		// Set up listeners
		settingsIds.forEach( ( id ) => {
			const field = jQuery( `#${ id }` );
			if ( field.length ) {
				// Using jQuery events due to select2 and iris (color picker) usage
				field.on( 'change', debounce( handleFieldChange, 400 ) );
			}
		} );

		return () => {
			// Remove listeners
			settingsIds.forEach( ( id ) => {
				const field = jQuery( `#${ id }` );
				if ( field.length ) {
					field.off( 'change' );
				}
			} );
		};
	}, [ setIsLoading, settingsIds, setCounter ] );

	return (
		<iframe
			src={ `${ src }&hash=${ counter }` }
			title={ __( 'Email preview frame', 'woocommerce' ) }
			onLoad={ () => setIsLoading( false ) }
		/>
	);
};