window.c.models = (function(m){
  var contributionDetail = m.postgrest.model('contribution_details'),

  contributions = m.postgrest.model('contributions'),

  teamTotal = m.postgrest.model('team_totals'),

  teamMember = m.postgrest.model('team_members');
  teamMember.pageSize(40);

  return {
    contributionDetail: contributionDetail,
    contributions: contributions,
    teamTotal: teamTotal,
    teamMember: teamMember
  };
}(window.m));
