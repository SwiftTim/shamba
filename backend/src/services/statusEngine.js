const getFieldStatus = (field) => {
    if (field.current_stage === 'harvested') return 'completed';

    const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(field.last_updated_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceUpdate > 7 && field.current_stage !== 'harvested') return 'at_risk';

    return 'active';
};

module.exports = { getFieldStatus };
