

`export ARN_IOT_PROVISIONING_ROLE=arn:aws:iam::305370495358:policy/fleet-provision-policy`
```
aws iot create-provisioning-template \
 --template-name fleet-provisioning-template \
 --provisioning-role-arn $ARN_IOT_PROVISIONING_ROLE \
 --template-body file://./fleet-provisioning-template.json \
 --enabled
```