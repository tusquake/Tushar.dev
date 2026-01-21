const Input = ({
    label,
    error,
    className = '',
    textarea = false,
    rows = 4,
    ...props
}) => {
    const Component = textarea ? 'textarea' : 'input';

    return (
        <div className={className}>
            {label && (
                <label className="label">
                    {label}
                    {props.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <Component
                className={`input ${error ? 'input-error' : ''}`}
                rows={textarea ? rows : undefined}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

export default Input;
